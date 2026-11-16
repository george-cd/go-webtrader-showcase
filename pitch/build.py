# build.py: one mp4 per scene (same size, fps, encoder), joined with -c copy, then music added.
import subprocess, os, re, sys, wave
import numpy as np
P, SC = '/tmp/pitch/', '/tmp/video/scenes/'
ENC = ['-c:v', 'libx264', '-crf', '20', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-r', '30']
FADE = 0.35
# (kind, image, seconds, scene folder for recordings)
PLAN = [('card', 'c1-hook.jpg', 6.5), ('card', 'c2-market.jpg', 9), ('card', 'c3-problem.jpg', 10),
        ('card', 'c4-answer.jpg', 7), ('card', 'c5-built.jpg', 4),
        ('rec', 'f1.png', 8.5, 't1-trade'), ('rec', 'f2.png', 8, 't7-coach'), ('rec', 'f3.png', 9, 't10-mam'),
        ('rec', 'f4.png', 8, 't14-track'), ('rec', 'f5.png', 8, 't11-saver'), ('rec', 'f6.png', 8, 't12-statement'),
        ('rec', 'f7.png', 9, 'd0-needs'), ('rec', 'f8.png', 8, 'd1-overview'), ('rec', 'f9.png', 8, 'd5-growth'),
        ('rec', 'f10.png', 8, 't4-brand'),
        ('card', 'c6-stack.jpg', 10), ('card', 'c7-facts.jpg', 8), ('card', 'c8-model.jpg', 10),
        ('card', 'c9-ask.jpg', 8), ('card', 'c10-end.jpg', 6)]
only = sys.argv[1:]  # optional: scene numbers to (re)build

def run(args, out):
    tmp = out[:-4] + '.part.mp4'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error'] + args + ENC + [tmp], check=True)
    os.rename(tmp, out)

def length(folder):
    return sum(float(x) for x in re.findall(r'duration ([\d.]+)', open(SC + folder + '/list.txt').read()))

os.makedirs(P + 'out', exist_ok=True)
outs = []
for i, s in enumerate(PLAN):
    out = f'{P}out/{i:02d}.mp4'; outs.append(out)
    if only and str(i) not in only: continue
    d = s[2]; fades = f'fade=t=in:st=0:d={FADE},fade=t=out:st={d-FADE:.2f}:d={FADE}'
    if s[0] == 'card':
        run(['-framerate', '30', '-i', P + 'img/' + s[1], '-vf', f'format=yuv420p,loop=-1:1,trim=duration={d},{fades}'], out)
    else:
        speed = min(max(length(s[3]) / d, 1), 1.7)   # long recordings play a little faster
        fc = (f'[1:v]setpts=PTS/{speed:.3f},fps=30,crop=1440:745:0:0,scale=1184:-2,tpad=stop_mode=clone:stop_duration=20[v];'
              f'[0:v][v]overlay=128:259,trim=duration={d},format=yuv420p,{fades}')
        run(['-framerate', '30', '-loop', '1', '-i', P + 'img/' + s[1], '-f', 'concat', '-safe', '0', '-i', SC + s[3] + '/list.txt',
             '-filter_complex', fc, '-t', str(d)], out)
    print('scene', i, s[1], 'ok', flush=True)

total = sum(s[2] for s in PLAN)
# soft music: slow pad chords + a gentle arpeggio, made from sine waves
sr = 44100; t = np.arange(int(sr * total)) / sr
f = lambda n: 440 * 2 ** ((n - 69) / 12)
chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]   # Am F C G
bar = 4.0; audio = np.zeros_like(t)
for k in range(int(total / bar) + 1):
    c = chords[k % 4]; a, b = k * bar, k * bar + bar + 1.0
    m = (t >= a) & (t < b); tt = t[m] - a
    env = np.minimum(tt / 1.2, 1) * np.minimum((b - a - tt) / 1.0, 1)
    for n in c + [c[0] - 12]:
        audio[m] += 0.05 * env * (np.sin(2 * np.pi * f(n) * tt) + 0.3 * np.sin(2 * np.pi * f(n) * 1.003 * tt))
    for j in range(8):   # eighth-note arpeggio
        st = a + j * bar / 8; n = c[[0, 1, 2, 1][j % 4]] + 12
        mm = (t >= st) & (t < st + 0.9); u = t[mm] - st
        audio[mm] += 0.035 * np.exp(-u * 4) * np.sin(2 * np.pi * f(n) * u)
fade = np.minimum(np.minimum(t / 2, 1), np.minimum((total - t) / 3, 1))
audio = audio * fade; audio = audio / np.abs(audio).max() * 0.35
pcm = (np.stack([audio, audio], 1) * 32767).astype(np.int16)
with wave.open(P + 'music.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr); w.writeframes(pcm.tobytes())

open(P + 'out/concat.txt', 'w').write(''.join(f"file '{o}'\n" for o in outs))
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', P + 'out/concat.txt', '-i', P + 'music.wav',
                '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart',
                P + 'pitch.part.mp4'], check=True)
os.rename(P + 'pitch.part.mp4', P + 'go-webtrader-pitch.mp4')
print('total', total)
