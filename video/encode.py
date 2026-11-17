# encode.py: one mp4 per scene (same size, fps, encoder), then join with -c copy.
import os, subprocess, re
V = '/tmp/video/'; os.makedirs(V + 'out', exist_ok=True)
ENC = ['-c:v', 'libx264', '-crf', '20', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-r', '30']
FADE = 0.3
def run(args, out):
    tmp = out[:-4] + '.part.mp4'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error'] + args + ENC + [tmp], check=True)
    os.rename(tmp, out)
def card(name, secs):
    out = V + 'out/' + name + '.mp4'
    if os.path.exists(out): return out
    vf = f'format=yuv420p,loop=-1:1,trim=duration={secs},fade=t=in:st=0:d={FADE},fade=t=out:st={secs-FADE}:d={FADE}'
    run(['-framerate', '30', '-i', V + 'cards/' + name + '.jpg', '-vf', vf], out); return out
def scene(name):
    d = V + 'scenes/' + name + '/'
    total = sum(float(x) for x in re.findall(r'duration ([\d.]+)', open(d + 'list.txt').read()))
    out = V + 'out/' + name + '.mp4'
    if os.path.exists(out) and os.path.getmtime(out) > os.path.getmtime(d + 'list.txt'): return out
    vf = f'fps=30,scale=1440:900,format=yuv420p,fade=t=in:st=0:d={FADE},fade=t=out:st={total-FADE:.2f}:d={FADE}'
    run(['-f', 'concat', '-safe', '0', '-i', d + 'list.txt', '-vf', vf], out); return out
def phone(name, secs=12):   # the phone app inside a phone body (the background is drawn by /tmp/pitch/phone.mjs)
    d = V + 'scenes/' + name + '/'; out = V + 'out/' + name + '.mp4'
    if os.path.exists(out) and os.path.getmtime(out) > os.path.getmtime(d + 'list.txt'): return out
    fc = (f"[1:v]setpts=PTS/1.4,fps=30,scale=446:760,format=yuva420p,geq=lum='p(X,Y)':cb='p(X,Y)':cr='p(X,Y)':"
          f"a='if(gt(hypot(max(abs(X-223)-183,0),max(abs(Y-380)-340,0)),40),0,255)',tpad=stop_mode=clone:stop_duration=5[r];"
          f"[0:v][r]overlay=894:70,trim=duration={secs},format=yuv420p,fade=t=in:st=0:d={FADE},fade=t=out:st={secs-FADE}:d={FADE}")
    run(['-framerate', '30', '-loop', '1', '-i', '/tmp/pitch/img/f11.png', '-f', 'concat', '-safe', '0', '-i', d + 'list.txt', '-filter_complex', fc, '-t', str(secs)], out)
    return out
order = [card('c0-intro', 4)] + [scene(s) for s in ['t1-trade', 't7-coach', 't2-cost', 't8-replay', 't9-funds', 't3-calendar', 't4-brand', 't5-prop', 't6-partner', 't10-mam', 't11-saver', 't12-statement', 't13-manager', 't14-track', 't15-whatif', 't16-report', 't17-explain']] + [phone('t18-mobile')] + \
        [card('c1-desk', 3.5)] + [scene(s) for s in ['d0-needs', 'd1-overview', 'd5-growth', 'd6-mam', 'd2-lp', 'd3-business', 'd4-ops']] + [card('c2-end', 5)]
open(V + 'out/concat.txt', 'w').write(''.join(f"file '{p}'\n" for p in order))
final = V + 'go-webtrader-demo.mp4'
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', V + 'out/concat.txt', '-c', 'copy', '-movflags', '+faststart', final + '.part.mp4'], check=True)
os.rename(final + '.part.mp4', final)
print(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration,size', '-of', 'compact', final], capture_output=True, text=True).stdout)
