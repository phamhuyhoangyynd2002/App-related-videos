#!/usr/bin/env python3
"""Tự tổng hợp bộ hiệu ứng âm thanh của kênh (không dùng mẫu âm thanh của ai). Chạy lại: python3 sfx/nguon/tao_sfx.py"""
import math, random, struct, wave
from pathlib import Path
SR = 44100
OUT = Path(__file__).resolve().parent.parent
random.seed(7)

def write(name, samples):
    peak = max(1e-9, max(abs(s) for s in samples))
    with wave.open(str(OUT / f"{name}.wav"), "w") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(b"".join(struct.pack("<h", int(s / peak * 0.89 * 32767)) for s in samples))

def env(i, n, a=0.005, curve=4.0):
    t = i / SR; att = min(1.0, t / a) if a else 1.0
    return att * (1 - i / n) ** curve

def lowpass(xs, k):
    y, out = 0.0, []
    for i, x in enumerate(xs):
        c = k(i) if callable(k) else k
        y += c * (x - y); out.append(y)
    return out

def whoosh(d=0.45):  # nhiễu lọc quét lên rồi xuống
    n = int(SR * d); noise = [random.uniform(-1, 1) for _ in range(n)]
    f = lowpass(noise, lambda i: 0.02 + 0.25 * math.sin(math.pi * i / n) ** 2)
    return [x * math.sin(math.pi * i / n) ** 1.5 for i, x in enumerate(f)]

def pop(d=0.12):  # sine tụt cao độ nhanh
    n = int(SR * d); ph = 0.0; out = []
    for i in range(n):
        ph += 2 * math.pi * (900 * math.exp(-i / SR * 40) + 180) / SR
        out.append(math.sin(ph) * env(i, n, 0.001, 3))
    return out

def ting(d=0.7, f=1760):  # chuông nhỏ, có hoạ âm
    n = int(SR * d)
    return [sum(a * math.sin(2 * math.pi * f * m * i / SR) for m, a in ((1, 1), (2.76, .35), (5.4, .12))) * env(i, n, 0.002, 5) for i in range(n)]

def drop(d=0.35):  # icon rơi vào hàng: trống trầm + tiếng tách
    n = int(SR * d); ph = 0.0; out = []
    for i in range(n):
        ph += 2 * math.pi * (160 * math.exp(-i / SR * 12) + 45) / SR
        click = random.uniform(-1, 1) * math.exp(-i / SR * 300) * 0.5
        out.append(math.sin(ph) * env(i, n, 0.001, 2.5) + click)
    return out

def rise(d=1.0):  # dâng lên trước khi lộ hạng
    n = int(SR * d); ph = 0.0; out = []
    noise = lowpass([random.uniform(-1, 1) for _ in range(n)], lambda i: 0.01 + 0.3 * (i / n) ** 2)
    for i in range(n):
        p = i / n; ph += 2 * math.pi * (200 + 900 * p * p) / SR
        out.append((0.5 * math.sin(ph) + 0.6 * noise[i]) * p ** 2 * (1 - max(0, p - 0.95) * 20))
    return out

def chu_ky():  # chữ ký của kênh ứng dụng (12/10/2026): hai tiếng chạm màn hình "tách tách" + ba nốt đi lên, dưới 1 giây
    out = [0.0] * int(SR * 0.95)
    for start in (0.0, 0.09):  # hai cú chạm: pop rất ngắn, cao
        t = pop(0.05); o = int(SR * start)
        for i, s in enumerate(t):
            if o + i < len(out): out[o + i] += 0.7 * s
    for start, f in ((0.2, 1046.5), (0.3, 1318.5), (0.4, 1568.0)):  # Đô – Mi – Son, quãng trưởng
        t = ting(0.5, f); o = int(SR * start)
        for i, s in enumerate(t):
            if o + i < len(out): out[o + i] += 0.5 * s
    return out

# Bộ âm thanh hài (kenh/cam-nang-phong-cach.md, mục 11)

def bonk(d=0.25):  # gõ gỗ: hai hoạ âm không hài hoà tắt rất nhanh
    n = int(SR * d)
    return [(math.sin(2 * math.pi * 520 * i / SR) + 0.6 * math.sin(2 * math.pi * 1370 * i / SR)
             + random.uniform(-1, 1) * math.exp(-i / SR * 400)) * env(i, n, 0.0005, 8) for i in range(n)]

def boing(d=0.5):  # lò xo: cao độ rung lắc quanh một nốt đi lên
    n = int(SR * d); ph = 0.0; out = []
    for i in range(n):
        t = i / SR
        ph += 2 * math.pi * (220 + 160 * t / d + 90 * math.sin(2 * math.pi * 14 * t) * math.exp(-t * 4)) / SR
        out.append(math.sin(ph) * env(i, n, 0.002, 1.5))
    return out

def ka_ching(d=0.8):  # máy tính tiền: tiếng cơ khí lách cách rồi chuông kép
    out = [0.0] * int(SR * d)
    for k in range(3):
        o = int(SR * 0.03 * k)
        for i in range(int(SR * 0.02)):
            out[o + i] += random.uniform(-1, 1) * math.exp(-i / SR * 250) * 0.6
    for start, f in ((0.1, 2093.0), (0.16, 2637.0)):
        t = ting(0.6, f); o = int(SR * start)
        for i, s in enumerate(t):
            if o + i < len(out): out[o + i] += 0.7 * s
    return out

def buzz_sai(d=0.45):  # chuông báo sai: sóng vuông trầm, hai nhịp
    n = int(SR * d); out = []
    for i in range(n):
        t = i / SR; on = 1.0 if (t % 0.22) < 0.18 else 0.0
        sq = 1.0 if math.sin(2 * math.pi * 110 * t) > 0 else -1.0
        out.append((sq + 0.5 * math.sin(2 * math.pi * 165 * t)) * on * 0.6)
    return lowpass(out, 0.25)

def de_kem(d=1.6):  # kèn buồn: bốn nốt đi xuống, nốt cuối rung
    notes = ((0.0, 311.1, 0.3), (0.32, 293.7, 0.3), (0.64, 277.2, 0.3), (0.96, 261.6, 0.64))
    out = [0.0] * int(SR * d)
    for start, f, dur in notes:
        o = int(SR * start); n = int(SR * dur); ph = 0.0
        for i in range(n):
            t = i / SR
            vib = 6 * math.sin(2 * math.pi * 5.5 * t) if dur > 0.5 else 0
            ph += 2 * math.pi * (f + vib) / SR
            s = sum(math.sin(ph * m) / m for m in (1, 2, 3, 4)) * min(1, t / 0.03) * (1 - i / n) ** 0.6
            if o + i < len(out): out[o + i] += s
    return lowpass(out, 0.3)

def im_lang(d=1.2):  # tiếng dế: chuỗi xung cao lặp lại, im lặng xen kẽ
    n = int(SR * d); out = []
    for i in range(n):
        t = i / SR; phase = t % 0.4
        chirp = math.sin(2 * math.pi * 4500 * t) * (1 if phase < 0.12 and (phase % 0.03) < 0.018 else 0)
        out.append(chirp * 0.5)
    return out

def xuoc_dia(d=0.35):  # dừng đột ngột: nhiễu lọc quét xuống rất nhanh
    n = int(SR * d); noise = [random.uniform(-1, 1) for _ in range(n)]
    f = lowpass(noise, lambda i: 0.35 * (1 - i / n) ** 2 + 0.01)
    ph = 0.0; out = []
    for i, x in enumerate(f):
        ph += 2 * math.pi * (700 * (1 - i / n) ** 2 + 60) / SR
        out.append((x + 0.5 * math.sin(ph)) * env(i, n, 0.001, 1.2))
    return out

import sys
ONLY = set(sys.argv[1:])  # vd. python3 tao_sfx.py chu-ky: chỉ tạo lại một file, giữ nguyên các file khác
for name, fn in {"whoosh": whoosh, "pop": pop, "ting": ting, "drop": drop, "rise": rise, "chu-ky": chu_ky,
                 "bonk": bonk, "boing": boing, "ka-ching": ka_ching, "buzz-sai": buzz_sai, "de-kem": de_kem,
                 "im-lang": im_lang, "xuoc-dia": xuoc_dia}.items():
    if ONLY and name not in ONLY:
        continue
    write(name, fn())
    print("ok", name)
