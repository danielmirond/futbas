#!/usr/bin/env python3
"""
Capture frames from the running preview server using simple HTTP screenshots.
This script creates placeholder frames from the demo HTML by rendering it.
"""
from PIL import Image, ImageDraw, ImageFont
import os

FRAMES_DIR = '/Users/danielmd/Desktop/code/.claude/worktrees/musing-snyder/public/frames'
os.makedirs(FRAMES_DIR, exist_ok=True)

W, H = 1280, 720
BG = '#0a0a0a'
RED = '#CC0000'
YELLOW = '#FFD700'
NEON = '#CCFF00'
WHITE = '#ffffff'
GRAY = '#888888'
DARK = '#111111'
CARD = '#161616'

def hex_to_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def new_frame():
    return Image.new('RGB', (W, H), hex_to_rgb(BG))

def draw_header(draw, logo_img=None):
    draw.rectangle([0, 0, W, 50], fill=hex_to_rgb(DARK))
    draw.rectangle([0, 47, W, 50], fill=hex_to_rgb(RED))
    if logo_img:
        pass  # logo handled separately
    try:
        font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 14)
        font_sm = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 11)
    except:
        font = ImageFont.load_default()
        font_sm = font
    draw.text((W-200, 18), 'EN DIRECTO · 12:04', fill=hex_to_rgb(GRAY), font=font_sm)
    # Red dot
    draw.ellipse([W-215, 20, W-207, 28], fill=hex_to_rgb(RED))

def get_font(size=14, bold=False):
    try:
        if bold:
            return ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', size)
        return ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', size)
    except:
        return ImageFont.load_default()

# Load logo
LOGO_PATH = '/Users/danielmd/Desktop/code/.claude/worktrees/musing-snyder/public/logo-md.png'
logo = Image.open(LOGO_PATH).resize((40, 40), Image.LANCZOS)

def paste_logo(img, x=15, y=5):
    img.paste(logo, (x, y), logo if logo.mode == 'RGBA' else None)

# ═══════ Frame 1: Cover ═══════
def frame_cover():
    img = new_frame()
    draw = ImageDraw.Draw(img)
    # Red bar
    draw.rectangle([0, H//2-3, W, H//2+3], fill=hex_to_rgb(RED))
    # Logo centered
    big_logo = logo.resize((120, 120), Image.LANCZOS)
    lx = W//2 - 60
    ly = H//2 - 120
    img.paste(big_logo, (lx, ly), big_logo if big_logo.mode == 'RGBA' else None)
    f_title = get_font(36, True)
    f_sub = get_font(14)
    f_sm = get_font(10)
    draw.text((W//2, H//2+20), 'Guía Fútbol TV', fill=hex_to_rgb(RED), font=f_title, anchor='mt')
    draw.text((W//2, H//2+70), 'Widget de programación futbolística para Mundo Deportivo', fill=hex_to_rgb(GRAY), font=f_sub, anchor='mt')
    draw.text((W//2, H-30), 'Next.js + TypeScript  |  WOSTI API  |  Datos en tiempo real', fill='#444444', font=f_sm, anchor='mt')
    return img

# ═══════ Frame 2: Main view ═══════
def frame_main():
    img = new_frame()
    draw = ImageDraw.Draw(img)
    # White app area
    draw.rectangle([40, 30, W-40, H-30], fill=hex_to_rgb('#ffffff'))
    # Header bar
    draw.rectangle([40, 30, W-40, 78], fill=hex_to_rgb(DARK))
    draw.rectangle([40, 75, W-40, 78], fill=hex_to_rgb(RED))
    app_logo = logo.resize((36, 36), Image.LANCZOS)
    img.paste(app_logo, (50, 34), app_logo if app_logo.mode == 'RGBA' else None)
    f = get_font(11)
    fb = get_font(13, True)
    fsm = get_font(9)
    draw.text((W-80, 50), 'EN DIRECTO', fill=hex_to_rgb(GRAY), font=fsm)
    # Sub header
    draw.text((60, 88), 'FÚTBOL · GUÍA TV', fill=hex_to_rgb(RED), font=fsm)
    draw.text((60, 104), 'Fútbol en la TV hoy', fill=hex_to_rgb('#1a1a1a'), font=get_font(18, True))
    # Day buttons
    days = ['AYER', 'HOY', 'MAÑANA', 'VIE 10', 'SÁB 11', 'DOM 12', 'LUN 13']
    bx = 60
    for i, d in enumerate(days):
        active = i == 1
        c = hex_to_rgb(RED) if active else hex_to_rgb('#e5e5e5')
        tc = hex_to_rgb(WHITE) if active else hex_to_rgb('#333333')
        draw.rounded_rectangle([bx, 135, bx+65, 155], radius=2, fill=c)
        draw.text((bx+32, 145), d, fill=tc, font=fsm, anchor='mm')
        bx += 70
    # Filter buttons
    filters = ['TODOS', 'EN ABIERTO', 'DE PAGO']
    bx = 60
    for i, fl in enumerate(filters):
        active = i == 0
        c = hex_to_rgb(RED) if active else hex_to_rgb('#e5e5e5')
        tc = hex_to_rgb(WHITE) if active else hex_to_rgb('#333333')
        draw.rounded_rectangle([bx, 165, bx+80, 185], radius=2, fill=c)
        draw.text((bx+40, 175), fl, fill=tc, font=fsm, anchor='mm')
        bx += 85
    draw.text((W-100, 175), '4 partidos', fill=hex_to_rgb(GRAY), font=fsm, anchor='mm')
    # Day separator
    draw.rectangle([60, 200, W-60, 225], fill=hex_to_rgb('#1a1a1a'))
    draw.rectangle([60, 200, 64, 225], fill=hex_to_rgb(RED))
    draw.text((75, 206), 'HOY · MIÉRCOLES, 8 DE ABRIL', fill=hex_to_rgb(WHITE), font=get_font(11, True))
    draw.text((W-120, 208), '4 partidos', fill=hex_to_rgb('#aaaaaa'), font=fsm)
    # Comp header
    draw.rounded_rectangle([60, 235, 220, 253], radius=2, fill=hex_to_rgb(RED))
    draw.text((70, 238), 'LALIGA EA SPORTS →', fill=hex_to_rgb(WHITE), font=get_font(9, True))
    # Match rows
    matches = [
        ('19:00', 'FC Barcelona', 'Atlético Madrid', 'LaLiga EA Sports', [('DAZN LALIGA', '#1a1a1a', NEON), ('M+ LALIGA', '#019DF4', WHITE)], '2-1', 'HT'),
        ('21:00', 'Real Madrid', 'Sevilla FC', 'LaLiga EA Sports', [('DAZN LALIGA', '#1a1a1a', NEON)], '1-0', "67'"),
    ]
    my = 265
    for time, home, away, comp, chs, score, st in matches:
        draw.rectangle([60, my, 64, my+50], fill=hex_to_rgb(RED))
        draw.line([60, my+50, W-60, my+50], fill=hex_to_rgb('#e5e5e5'))
        draw.text((75, my+5), time, fill=hex_to_rgb(RED), font=get_font(14, True))
        draw.text((75, my+22), 'HOY', fill=hex_to_rgb(GRAY), font=get_font(8))
        draw.text((130, my+8), f'{home}  vs  {away}', fill=hex_to_rgb('#1a1a1a'), font=fb)
        draw.text((130, my+28), comp, fill=hex_to_rgb(GRAY), font=fsm)
        # Score
        sc_color = hex_to_rgb(RED) if st.endswith("'") else hex_to_rgb('#f4a261')
        draw.rounded_rectangle([W-200, my+5, W-160, my+25], radius=3, fill=sc_color)
        draw.text((W-180, my+15), score, fill=hex_to_rgb(WHITE), font=get_font(12, True), anchor='mm')
        draw.text((W-150, my+10), st, fill=sc_color, font=get_font(8, True))
        # Channel tags
        cx = W-200
        for ch_name, ch_bg, ch_tx in chs:
            tw = len(ch_name) * 6 + 10
            draw.rounded_rectangle([cx, my+30, cx+tw, my+44], radius=2, fill=hex_to_rgb(ch_bg))
            draw.text((cx+5, my+33), ch_name, fill=hex_to_rgb(ch_tx), font=get_font(8, True))
            cx += tw + 4
        my += 55
    # Amistoso
    draw.rounded_rectangle([60, my+5, 140, my+23], radius=2, fill=hex_to_rgb(RED))
    draw.text((70, my+8), 'AMISTOSO →', fill=hex_to_rgb(WHITE), font=get_font(9, True))
    my += 30
    draw.rectangle([60, my, 64, my+50], fill=hex_to_rgb(RED))
    draw.text((75, my+5), '20:00', fill=hex_to_rgb(RED), font=get_font(14, True))
    draw.text((130, my+8), 'España  vs  Serbia', fill=hex_to_rgb('#1a1a1a'), font=fb)
    draw.text((130, my+28), 'Amistoso', fill=hex_to_rgb(GRAY), font=fsm)
    # TVE tags
    draw.rounded_rectangle([W-200, my+8, W-150, my+22], radius=2, fill=hex_to_rgb('#1C3A7A'))
    draw.text((W-195, my+10), 'LA 1 TVE', fill=hex_to_rgb(WHITE), font=get_font(8, True))
    draw.rounded_rectangle([W-145, my+8, W-85, my+22], radius=2, fill=hex_to_rgb('#E4002B'))
    draw.text((W-140, my+10), 'RTVE PLAY', fill=hex_to_rgb(WHITE), font=get_font(8, True))
    # Slide label
    draw.rounded_rectangle([20, H-65, 200, H-40], radius=4, fill=hex_to_rgb(RED))
    draw.text((30, H-60), '1  VISTA PRINCIPAL', fill=hex_to_rgb(WHITE), font=get_font(11, True))
    draw.text((20, H-30), 'Partidos del día con marcadores en vivo', fill=hex_to_rgb(WHITE), font=get_font(12, True))
    return img

# ═══════ Frame 3: Classification ═══════
def frame_classification():
    img = new_frame()
    draw = ImageDraw.Draw(img)
    draw.rectangle([40, 30, W-40, H-30], fill=hex_to_rgb('#ffffff'))
    draw.rectangle([40, 30, W-40, 78], fill=hex_to_rgb(DARK))
    draw.rectangle([40, 75, W-40, 78], fill=hex_to_rgb(RED))
    app_logo = logo.resize((36, 36), Image.LANCZOS)
    img.paste(app_logo, (50, 34), app_logo if app_logo.mode == 'RGBA' else None)
    f = get_font(11)
    fb = get_font(12, True)
    fsm = get_font(9)
    # Breadcrumb
    draw.rectangle([40, 78, W-40, 100], fill=hex_to_rgb('#f7f7f7'))
    draw.text((60, 84), '← Guía TV  /  LaLiga EA Sports', fill=hex_to_rgb(RED), font=fsm)
    # Comp header
    draw.text((60, 110), 'COMPETICIÓN', fill=hex_to_rgb(RED), font=get_font(8, True))
    draw.text((60, 124), 'LaLiga EA Sports', fill=hex_to_rgb('#1a1a1a'), font=get_font(16, True))
    # Tabs
    tabs = [('CLASIFICACIÓN', True), ('RESULTADOS', False), ('PRÓXIMOS', False)]
    tx = 60
    for label, active in tabs:
        tw = len(label) * 7 + 20
        c = hex_to_rgb(RED) if active else hex_to_rgb('#f7f7f7')
        tc = hex_to_rgb(WHITE) if active else hex_to_rgb('#333333')
        draw.rectangle([tx, 150, tx+tw, 172], fill=c)
        draw.text((tx+10, 155), label, fill=tc, font=get_font(9, True))
        tx += tw + 2
    # Legend
    legends = [('#e8f5e9', 'Champions'), ('#e3f2fd', 'Europa L.'), ('#fff8e1', 'Conference'), ('#fde8e8', 'Descenso')]
    lx = 60
    for color, label in legends:
        draw.rectangle([lx, 182, lx+12, 194], fill=hex_to_rgb(color), outline=hex_to_rgb('#e5e5e5'))
        draw.text((lx+16, 184), label, fill=hex_to_rgb(GRAY), font=get_font(8))
        lx += 80
    # Table header
    draw.text((60, 205), '#', fill=hex_to_rgb(GRAY), font=get_font(9, True))
    draw.text((85, 205), 'Equipo', fill=hex_to_rgb(GRAY), font=get_font(9, True))
    draw.text((300, 205), 'PJ', fill=hex_to_rgb(GRAY), font=get_font(9, True))
    draw.text((340, 205), 'G', fill=hex_to_rgb(GRAY), font=get_font(9, True))
    draw.text((370, 205), 'E', fill=hex_to_rgb(GRAY), font=get_font(9, True))
    draw.text((400, 205), 'P', fill=hex_to_rgb(GRAY), font=get_font(9, True))
    draw.text((440, 205), 'DG', fill=hex_to_rgb(GRAY), font=get_font(9, True))
    draw.text((510, 205), 'Forma', fill=hex_to_rgb(GRAY), font=get_font(9, True))
    draw.text((600, 205), 'Pts', fill=hex_to_rgb(GRAY), font=get_font(9, True))
    draw.line([60, 218, W-60, 218], fill=hex_to_rgb('#1a1a1a'), width=2)
    # Rows
    table = [
        (1, 'FC Barcelona', 30, 22, 6, 2, '+40', 72, '#e8f5e9', ['W','W','D','W','W']),
        (2, 'Real Madrid', 30, 21, 5, 4, '+30', 68, '#e8f5e9', ['W','L','W','W','D']),
        (3, 'Atlético Madrid', 30, 18, 6, 6, '+17', 60, '#e8f5e9', ['W','W','W','D','L']),
        (4, 'Athletic Club', 30, 15, 9, 6, '+7', 54, '#e8f5e9', ['D','W','D','W','W']),
        (5, 'Villarreal', 30, 14, 9, 7, '+8', 51, '#e3f2fd', ['L','W','W','D','W']),
        (6, 'Real Sociedad', 30, 14, 7, 9, '+4', 49, '#e3f2fd', ['W','L','D','W','L']),
        (7, 'Sevilla FC', 30, 12, 9, 9, '-1', 45, '#fff8e1', ['D','L','W','D','W']),
        (8, 'Real Betis', 30, 12, 7, 11, '-4', 43, '#ffffff', ['W','W','L','L','D']),
        (9, 'Girona FC', 30, 9, 9, 12, '-7', 36, '#ffffff', ['L','W','D','D','W']),
        (10, 'Osasuna', 30, 10, 7, 13, '-12', 37, '#ffffff', ['D','D','W','L','D']),
    ]
    ry = 225
    for pos, team, pj, g, e, p, dg, pts, zone, form in table:
        draw.rectangle([60, ry, W-60, ry+22], fill=hex_to_rgb(zone))
        pc = '#166534' if pos <= 4 else GRAY
        draw.text((65, ry+4), str(pos), fill=hex_to_rgb(pc), font=get_font(10, True))
        draw.text((85, ry+4), team, fill=hex_to_rgb('#1a1a1a'), font=get_font(10, True))
        draw.text((305, ry+4), str(pj), fill=hex_to_rgb(GRAY), font=f)
        draw.text((340, ry+4), str(g), fill=hex_to_rgb('#1a1a1a'), font=f)
        draw.text((370, ry+4), str(e), fill=hex_to_rgb('#1a1a1a'), font=f)
        draw.text((400, ry+4), str(p), fill=hex_to_rgb('#1a1a1a'), font=f)
        dgc = '#166534' if dg.startswith('+') else RED
        draw.text((440, ry+4), dg, fill=hex_to_rgb(dgc), font=get_font(10, True))
        # Form dots
        fx = 510
        for fi in form:
            fc = '#22c55e' if fi == 'W' else '#f59e0b' if fi == 'D' else '#ef4444'
            draw.ellipse([fx, ry+4, fx+14, ry+18], fill=hex_to_rgb(fc))
            draw.text((fx+7, ry+11), fi, fill=hex_to_rgb(WHITE), font=get_font(8, True), anchor='mm')
            fx += 17
        draw.text((600, ry+3), str(pts), fill=hex_to_rgb('#1a1a1a'), font=get_font(12, True))
        draw.line([60, ry+22, W-60, ry+22], fill=hex_to_rgb('#e5e5e5'))
        ry += 24
    # Slide label
    draw.rounded_rectangle([20, H-65, 250, H-40], radius=4, fill=hex_to_rgb(RED))
    draw.text((30, H-60), '3  CLASIFICACIÓN', fill=hex_to_rgb(WHITE), font=get_font(11, True))
    draw.text((20, H-30), 'Tabla completa con zonas y forma reciente', fill=hex_to_rgb(WHITE), font=get_font(12, True))
    return img

# ═══════ Frame 4: SEO ═══════
def frame_seo():
    img = new_frame()
    draw = ImageDraw.Draw(img)
    f = get_font(11)
    fb = get_font(13, True)
    fsm = get_font(9)
    # Slide info
    draw.rounded_rectangle([20, 15, 180, 38], radius=4, fill=hex_to_rgb(RED))
    draw.text((30, 19), '6  ESTRATEGIA SEO', fill=hex_to_rgb(WHITE), font=get_font(10, True))
    draw.text((20, 50), 'Capturar el tráfico de búsqueda de programación deportiva', fill=hex_to_rgb(WHITE), font=get_font(20, True))
    draw.text((20, 80), 'Cada página del widget es una landing optimizada para keywords de alta intención.', fill=hex_to_rgb(GRAY), font=f)
    # Left card - Cluster 1
    draw.rounded_rectangle([20, 110, W//2-10, 400], radius=6, fill=hex_to_rgb(CARD), outline=hex_to_rgb('#222222'))
    draw.text((35, 120), '"FUTBOL EN TV" — SEMrush', fill=hex_to_rgb(WHITE), font=fb)
    # Metrics
    metrics = ['15.915 kw', '450K vol./mes', 'KD 43%']
    mx = 35
    for m in metrics:
        tw = len(m) * 7 + 16
        draw.rounded_rectangle([mx, 145, mx+tw, 163], radius=3, fill=hex_to_rgb('#1a1a1a'), outline=hex_to_rgb('#333333'))
        draw.text((mx+8, 148), m, fill=hex_to_rgb(NEON), font=get_font(9, True))
        mx += tw + 5
    # Keywords
    kws = [
        ('"futbol hoy tv"', '60.500/mes'),
        ('"futbol libre tv"', '49.500/mes'),
        ('"futbol hoy en tv"', '33.100/mes'),
        ('"futbol tv"', '22.200/mes'),
        ('"futbol en la tv"', '18.100/mes'),
        ('"futbol tv hoy"', '18.100/mes'),
        ('"futbol en tv"', '12.100/mes'),
    ]
    ky = 180
    for kw, vol in kws:
        draw.text((40, ky), kw, fill=hex_to_rgb(WHITE), font=f)
        draw.text((W//2-60, ky), vol, fill=hex_to_rgb(NEON), font=get_font(10, True), anchor='rt')
        ky += 24
    draw.text((35, 380), 'Volumen total: 450K búsquedas/mes', fill=hex_to_rgb(NEON), font=get_font(9, True))
    # Right card - Cluster 2
    draw.rounded_rectangle([W//2+10, 110, W-20, 400], radius=6, fill=hex_to_rgb(CARD), outline=hex_to_rgb('#222222'))
    draw.text((W//2+25, 120), '"PARTIDOS HOY EN TV"', fill=hex_to_rgb(WHITE), font=fb)
    mx = W//2+25
    for m in ['498 kw', '17.6K vol./mes', 'KD 53%']:
        tw = len(m) * 7 + 16
        draw.rounded_rectangle([mx, 145, mx+tw, 163], radius=3, fill=hex_to_rgb('#1a1a1a'), outline=hex_to_rgb('#333333'))
        draw.text((mx+8, 148), m, fill=hex_to_rgb(NEON), font=get_font(9, True))
        mx += tw + 5
    kws2 = [
        ('"partidos de futbol hoy en tv"', '4.400/mes'),
        ('"partidos en tv hoy"', '1.900/mes'),
        ('"que partido televisan hoy"', '1.600/mes'),
        ('"partidos de hoy en tv"', '1.300/mes'),
        ('"partidos hoy en tv"', '1.300/mes'),
        ('"partido en abierto gol tv"', '1.000/mes'),
    ]
    ky = 180
    for kw, vol in kws2:
        draw.text((W//2+30, ky), kw, fill=hex_to_rgb(WHITE), font=f)
        draw.text((W-60, ky), vol, fill=hex_to_rgb(NEON), font=get_font(10, True), anchor='rt')
        ky += 24
    # Total opportunity
    draw.rounded_rectangle([20, 415, W-20, 470], radius=6, fill=hex_to_rgb(RED))
    draw.text((40, 425), 'Oportunidad total: +600K búsquedas/mes', fill=hex_to_rgb(NEON), font=get_font(16, True))
    draw.text((40, 450), 'Tráfico que hoy se reparte entre futbolenlatv.es y agregadores sin marca editorial.', fill=hex_to_rgb(WHITE), font=f)
    # Clusters
    draw.text((20, 490), 'Clusters de intención (concordancia amplia)', fill=hex_to_rgb(WHITE), font=fb)
    clusters = [('vivo', '1.274'), ('ver', '1.254'), ('gratis', '556'), ('directo', '395'), ('hoy', '395'), ('partido', '243'), ('movistar', '202'), ('canal', '149')]
    cx = 20
    for label, count in clusters:
        draw.rounded_rectangle([cx, 515, cx+140, 555], radius=4, fill=hex_to_rgb('#1a1a1a'), outline=hex_to_rgb('#333333'))
        draw.text((cx+10, 520), label, fill=hex_to_rgb(WHITE), font=get_font(11, True))
        draw.text((cx+10, 537), count + ' kw', fill=hex_to_rgb(NEON), font=get_font(9, True))
        cx += 148
    return img

# ═══════ Frame 5: Widgets de equipo ═══════
def frame_widgets():
    img = new_frame()
    draw = ImageDraw.Draw(img)
    f = get_font(11)
    fb = get_font(12, True)
    fsm = get_font(9)
    draw.rounded_rectangle([20, 15, 230, 38], radius=4, fill=hex_to_rgb(RED))
    draw.text((30, 19), '8  WIDGETS DE EQUIPO', fill=hex_to_rgb(WHITE), font=get_font(10, True))
    draw.text((20, 50), 'Un widget dedicado para cada equipo', fill=hex_to_rgb(WHITE), font=get_font(20, True))
    draw.text((20, 80), 'Cada página de equipo incluye un widget con próximos partidos, canales y horarios.', fill=hex_to_rgb(GRAY), font=f)
    teams = [
        ('B', '#A50044', 'FC Barcelona', [('19:00', 'Barcelona vs Atlético', 'DAZN'), ('21:00', 'Sevilla vs Barcelona', 'M+ LaLiga'), ('18:45', 'Barcelona vs Bayern', 'UCL')]),
        ('RM', '#FEBE10', 'Real Madrid', [('21:00', 'R. Madrid vs Sevilla', 'DAZN'), ('16:15', 'Celta vs R. Madrid', 'LaLiga TV'), ('21:00', 'R. Madrid vs Man City', 'UCL')]),
        ('ATM', '#CE1126', 'Atlético Madrid', [('19:00', 'Barcelona vs Atlético', 'DAZN'), ('21:00', 'Atlético vs Betis', 'M+ LaLiga')]),
        ('ATH', '#EE2523', 'Athletic Club', [('16:15', 'Athletic vs Villarreal', 'DAZN'), ('19:00', 'R. Sociedad vs Athletic', 'M+ LaLiga')]),
    ]
    cw = (W - 60) // 2
    for idx, (abbr, color, name, matches) in enumerate(teams):
        col = idx % 2
        row = idx // 2
        x = 20 + col * (cw + 20)
        y = 110 + row * 210
        draw.rounded_rectangle([x, y, x+cw, y+190], radius=6, fill=hex_to_rgb(CARD), outline=hex_to_rgb('#222222'))
        # Team dot
        draw.ellipse([x+12, y+12, x+40, y+40], fill=hex_to_rgb(color))
        draw.text((x+26, y+26), abbr, fill=hex_to_rgb(WHITE), font=get_font(9, True), anchor='mm')
        draw.text((x+50, y+18), name, fill=hex_to_rgb(WHITE), font=fb)
        draw.text((x+cw-50, y+20), f'{len(matches)} próx.', fill=hex_to_rgb(GRAY), font=fsm)
        # Matches
        my = y + 50
        for time, teams_str, tv in matches:
            draw.text((x+15, my), time, fill=hex_to_rgb(RED), font=get_font(10, True))
            draw.text((x+60, my), teams_str, fill=hex_to_rgb('#bbbbbb'), font=f)
            # Channel tag
            n = tv.lower()
            if 'dazn' in n:
                bg, tx = '#1a1a1a', NEON
            elif 'm+' in n or 'movistar' in n:
                bg, tx = '#019DF4', WHITE
            elif 'laliga' in n:
                bg, tx = '#EE1044', WHITE
            elif 'ucl' in n:
                bg, tx = '#0D1541', WHITE
            else:
                bg, tx = '#333333', WHITE
            tw = len(tv) * 6 + 12
            draw.rounded_rectangle([x+cw-tw-10, my-2, x+cw-10, my+14], radius=2, fill=hex_to_rgb(bg))
            draw.text((x+cw-tw-5, my), tv.upper(), fill=hex_to_rgb(tx), font=get_font(8, True))
            my += 28
            draw.line([x+15, my-12, x+cw-15, my-12], fill=hex_to_rgb('#222222'))
        # Footer
        draw.text((x+cw//2, y+175), f'mundodeportivo.com/futbol/{name.lower().replace(" ","-")}', fill='#444444', font=get_font(8), anchor='mt')
    return img

# ═══════ Frame 6: Objective ═══════
def frame_objective():
    img = new_frame()
    draw = ImageDraw.Draw(img)
    f = get_font(11)
    fb = get_font(13, True)
    fsm = get_font(9)
    draw.rounded_rectangle([20, 15, 250, 38], radius=4, fill=hex_to_rgb(RED))
    draw.text((30, 19), '5  OBJETIVO DE PRODUCTO', fill=hex_to_rgb(WHITE), font=get_font(10, True))
    draw.text((20, 50), 'Convertir MD en la referencia de programación futbolística', fill=hex_to_rgb(WHITE), font=get_font(18, True))
    # Problem card
    draw.rounded_rectangle([20, 95, W//2-10, 310], radius=6, fill=hex_to_rgb(CARD), outline=hex_to_rgb('#222222'))
    draw.text((35, 105), 'El problema que resolvemos', fill=hex_to_rgb(WHITE), font=fb)
    lines = [
        'Millones buscan cada día "dónde ver el partido"',
        'y acaban en páginas de terceros.',
        '',
        'Las búsquedas son recurrentes: el usuario',
        'vuelve cada jornada, cada Champions.',
        '',
        'Ningún medio ofrece una experiencia',
        'dedicada, rápida y bien diseñada para esto.',
    ]
    ly = 130
    for l in lines:
        c = hex_to_rgb(RED) if 'dónde ver' in l else hex_to_rgb('#bbbbbb')
        draw.text((35, ly), l, fill=c, font=f)
        ly += 18
    # Engagement card
    draw.rounded_rectangle([W//2+10, 95, W-20, 310], radius=6, fill=hex_to_rgb(CARD), outline=hex_to_rgb('#222222'))
    draw.text((W//2+25, 105), 'Modelo de engagement', fill=hex_to_rgb(WHITE), font=fb)
    steps = [('Búsqueda', '"dónde ver Barça"'), ('Widget', 'Respuesta inmediata'), ('Contenido MD', 'Previa, crónica'), ('Retención', 'Vuelve mañana')]
    sx = W//2+30
    for i, (title, desc) in enumerate(steps):
        draw.rounded_rectangle([sx, 140, sx+120, 200], radius=4, fill=hex_to_rgb('#1a1a1a'))
        draw.text((sx+60, 160), title, fill=hex_to_rgb(WHITE), font=get_font(10, True), anchor='mt')
        draw.text((sx+60, 180), desc, fill=hex_to_rgb(GRAY), font=get_font(8), anchor='mt')
        if i < 3:
            draw.text((sx+128, 168), '→', fill=hex_to_rgb(RED), font=get_font(14, True))
        sx += 135
    draw.text((W*3//4, 280), 'De la utilidad al hábito.', fill=hex_to_rgb(GRAY), font=fsm, anchor='mt')
    draw.text((W*3//4, 295), 'Del hábito a la fidelidad.', fill=hex_to_rgb(GRAY), font=fsm, anchor='mt')
    # KPIs
    draw.rounded_rectangle([20, 325, W-20, 390], radius=6, fill=hex_to_rgb(CARD), outline=hex_to_rgb('#222222'))
    draw.text((35, 335), 'KPIs objetivo', fill=hex_to_rgb(WHITE), font=fb)
    kpis = ['+30% visitas recurrentes', 'Top 3 "futbol TV hoy"', '-40% bounce rate', '+2 páginas/sesión', 'Widget embeddable']
    mx = 35
    for k in kpis:
        tw = len(k) * 7 + 16
        draw.rounded_rectangle([mx, 360, mx+tw, 378], radius=3, fill=hex_to_rgb('#1a1a1a'), outline=hex_to_rgb('#333333'))
        draw.text((mx+8, 363), k, fill=hex_to_rgb(NEON), font=get_font(9, True))
        mx += tw + 5
    # Features grid
    draw.text((20, 410), 'Características del widget', fill=hex_to_rgb(WHITE), font=fb)
    features = [
        ('⚽', 'Partidos en directo', 'Marcadores en tiempo real'),
        ('📺', 'Canales con marca', 'Colores corporativos DAZN, Movistar+...'),
        ('📅', '7 días de programación', 'Navega ayer, hoy, mañana y más'),
        ('🔍', 'Filtros avanzados', 'Por canal, competición o equipo'),
        ('🏆', 'Páginas de competición', 'Clasificación, resultados, próximos'),
        ('📱', 'Responsive', 'Móvil, tablet y desktop'),
    ]
    fx = 20
    fy = 440
    for i, (icon, title, desc) in enumerate(features):
        if i == 3:
            fx = 20
            fy += 100
        draw.rounded_rectangle([fx, fy, fx+(W-60)//3-10, fy+85], radius=6, fill=hex_to_rgb(CARD), outline=hex_to_rgb('#222222'))
        draw.text((fx+15, fy+10), icon, fill=hex_to_rgb(WHITE), font=get_font(18))
        draw.text((fx+15, fy+35), title, fill=hex_to_rgb(WHITE), font=get_font(11, True))
        draw.text((fx+15, fy+55), desc, fill=hex_to_rgb(GRAY), font=fsm)
        fx += (W-60)//3 + 10
    return img

# ═══════ Generate all frames ═══════
print("Generando frames...")
generators = [
    ('frame_01_cover.png', frame_cover),
    ('frame_02_main.png', frame_main),
    ('frame_03_classification.png', frame_classification),
    ('frame_04_objective.png', frame_objective),
    ('frame_05_seo.png', frame_seo),
    ('frame_06_widgets.png', frame_widgets),
]

for name, gen in generators:
    img = gen()
    path = os.path.join(FRAMES_DIR, name)
    img.save(path, 'PNG')
    print(f"  ✓ {name}")

print(f"\nTotal: {len(generators)} frames en {FRAMES_DIR}")
