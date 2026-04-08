#!/usr/bin/env python3
"""Generate pitch PDF for Guía Fútbol TV"""

from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor, white, black
from reportlab.pdfgen import canvas
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle

W, H = landscape(A4)

# Colors
RED = HexColor('#CC0000')
YELLOW = HexColor('#FFD700')
NEON = HexColor('#CCFF00')
BG = HexColor('#0a0a0a')
CARD_BG = HexColor('#1e1e1e')
CARD_BORDER = HexColor('#444444')
GRAY = HexColor('#888888')
LIGHT_GRAY = HexColor('#bbbbbb')
WHITE = white
DAZN_BG = HexColor('#1a1a1a')
DAZN_TEXT = HexColor('#CCFF00')
MOVISTAR = HexColor('#019DF4')
LALIGA_RED = HexColor('#EE1044')
GOL = HexColor('#C8A415')
TVE = HexColor('#1C3A7A')
RTVE = HexColor('#E4002B')
UEFA = HexColor('#004A99')
ZONE_CHAMPIONS = HexColor('#1a3a1a')
ZONE_EUROPA = HexColor('#1a2a3a')
ZONE_CONFERENCE = HexColor('#2a2a1a')
ZONE_DESCENSO = HexColor('#2a1a1a')
ORANGE_HT = HexColor('#f4a261')
GREEN_W = HexColor('#22c55e')
YELLOW_D = HexColor('#f59e0b')
RED_L = HexColor('#ef4444')

OUTPUT = '/Users/danielmd/Desktop/code/.claude/worktrees/musing-snyder/public/demo-pitch.pdf'
LOGO = '/Users/danielmd/Desktop/code/.claude/worktrees/musing-snyder/public/logo-md.png'


def draw_bg(c):
    c.setFillColor(BG)
    c.rect(0, 0, W, H, fill=1, stroke=0)


def draw_header(c):
    """MD logo bar at top"""
    c.setFillColor(HexColor('#111111'))
    c.rect(0, H - 28*mm, W, 28*mm, fill=1, stroke=0)
    c.setFillColor(RED)
    c.rect(0, H - 28*mm, W, 1.5*mm, fill=1, stroke=0)
    # Logo image
    c.drawImage(LOGO, 15*mm, H - 25*mm, width=18*mm, height=18*mm, mask='auto')


def draw_slide_num(c, num, label):
    c.setFillColor(RED)
    c.circle(25*mm, H - 38*mm, 5*mm, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont('Helvetica-Bold', 9)
    c.drawCentredString(25*mm, H - 40*mm, str(num))
    c.setFillColor(RED)
    c.setFont('Helvetica-Bold', 8)
    c.drawString(33*mm, H - 40*mm, label.upper())


def draw_title(c, text, y=None):
    if y is None:
        y = H - 55*mm
    c.setFillColor(WHITE)
    c.setFont('Helvetica-BoldOblique', 22)
    # Word wrap manually for long titles
    words = text.split(' ')
    lines = []
    line = ''
    for w in words:
        test = line + (' ' if line else '') + w
        if c.stringWidth(test, 'Helvetica-BoldOblique', 22) > W - 50*mm:
            lines.append(line)
            line = w
        else:
            line = test
    if line:
        lines.append(line)
    for i, l in enumerate(lines):
        c.drawString(25*mm, y - i * 10*mm, l)
    return y - (len(lines) - 1) * 10*mm


def draw_desc(c, text, y):
    c.setFillColor(GRAY)
    c.setFont('Helvetica', 10)
    words = text.split(' ')
    lines = []
    line = ''
    for w in words:
        test = line + (' ' if line else '') + w
        if c.stringWidth(test, 'Helvetica', 10) > W - 50*mm:
            lines.append(line)
            line = w
        else:
            line = test
    if line:
        lines.append(line)
    for i, l in enumerate(lines):
        c.drawString(25*mm, y - i * 5*mm, l)
    return y - len(lines) * 5*mm


def draw_card(c, x, y, w, h, border_color=CARD_BORDER):
    c.setFillColor(CARD_BG)
    c.setStrokeColor(border_color)
    c.setLineWidth(1.2)
    c.roundRect(x, y, w, h, 3*mm, fill=1, stroke=1)


def draw_metric(c, text, x, y):
    tw = c.stringWidth(text, 'Helvetica-Bold', 9) + 8*mm
    c.setFillColor(HexColor('#1a1a1a'))
    c.setStrokeColor(HexColor('#333333'))
    c.setLineWidth(0.5)
    c.roundRect(x, y - 2*mm, tw, 7*mm, 1.5*mm, fill=1, stroke=1)
    c.setFillColor(NEON)
    c.setFont('Helvetica-Bold', 9)
    c.drawString(x + 4*mm, y, text)
    return x + tw + 2*mm


def draw_ch_tag(c, name, x, y, w=None):
    n = name.lower()
    if 'dazn' in n:
        bg, tx = DAZN_BG, DAZN_TEXT
    elif 'movistar' in n or 'm+' in n:
        bg, tx = MOVISTAR, WHITE
    elif 'laliga' in n:
        bg, tx = LALIGA_RED, WHITE
    elif 'gol' in n:
        bg, tx = GOL, WHITE
    elif 'la 1' in n or 'tve' in n:
        bg, tx = TVE, WHITE
    elif 'rtve' in n:
        bg, tx = RTVE, WHITE
    elif 'uefa' in n or 'ucl' in n:
        bg, tx = UEFA, WHITE
    else:
        bg, tx = HexColor('#333333'), WHITE

    c.setFont('Helvetica-Bold', 7)
    tw = w or (c.stringWidth(name.upper(), 'Helvetica-Bold', 7) + 4*mm)
    c.setFillColor(bg)
    c.roundRect(x, y - 1*mm, tw, 5*mm, 1*mm, fill=1, stroke=0)
    c.setFillColor(tx)
    c.drawString(x + 2*mm, y + 0.5*mm, name.upper())
    return x + tw + 1.5*mm


def draw_match_row(c, time, home, away, comp, channels, y, score=None, score_st=None):
    # Time
    c.setFillColor(RED)
    c.setFont('Helvetica-BoldOblique', 12)
    c.drawString(30*mm, y, time)
    # Teams
    c.setFillColor(WHITE)
    c.setFont('Helvetica-Bold', 11)
    c.drawString(55*mm, y, home)
    c.setFillColor(GRAY)
    c.setFont('Helvetica', 9)
    c.drawString(55*mm + c.stringWidth(home, 'Helvetica-Bold', 11) + 2*mm, y + 0.5*mm, 'vs')
    c.setFillColor(WHITE)
    c.setFont('Helvetica-Bold', 11)
    vs_w = c.stringWidth(home, 'Helvetica-Bold', 11) + c.stringWidth('vs', 'Helvetica', 9) + 6*mm
    c.drawString(55*mm + vs_w, y, away)
    # Comp
    c.setFillColor(GRAY)
    c.setFont('Helvetica', 8)
    c.drawString(55*mm, y - 5*mm, comp)
    # Score
    sx = W - 80*mm
    if score:
        sh, sa = score
        if score_st == 'LIVE':
            bg = RED
        elif score_st == 'HT':
            bg = ORANGE_HT
        else:
            bg = HexColor('#333333')
        c.setFillColor(bg)
        c.roundRect(sx, y - 2*mm, 18*mm, 7*mm, 1.5*mm, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont('Helvetica-Bold', 11)
        c.drawCentredString(sx + 9*mm, y, f'{sh} - {sa}')
        if score_st:
            lbl = {"LIVE": "67'", "HT": "HT", "FT": "FIN"}.get(score_st, score_st)
            c.setFillColor(bg if bg != HexColor('#333333') else GRAY)
            c.setFont('Helvetica-Bold', 7)
            c.drawString(sx + 20*mm, y + 0.5*mm, lbl)
        sx = sx + 30*mm
    else:
        sx = W - 50*mm
    # Channels
    cx = sx
    for ch in channels:
        cx = draw_ch_tag(c, ch, cx, y)
    # Border left
    c.setFillColor(RED)
    c.rect(27*mm, y - 6*mm, 1*mm, 12*mm, fill=1, stroke=0)
    # Bottom line
    c.setStrokeColor(HexColor('#222222'))
    c.setLineWidth(0.3)
    c.line(27*mm, y - 7*mm, W - 25*mm, y - 7*mm)


# ═══════════════════════════════════════════════════════════════
# SLIDE 1: Cover
# ═══════════════════════════════════════════════════════════════
def slide_cover(c):
    draw_bg(c)
    # Big red bar
    c.setFillColor(RED)
    c.rect(0, H/2 - 2*mm, W, 4*mm, fill=1, stroke=0)
    # Logo PNG
    c.drawImage(LOGO, W/2 - 20*mm, H/2 + 20*mm, width=40*mm, height=40*mm, mask='auto')
    # Title
    c.setFont('Helvetica-BoldOblique', 28)
    c.setFillColor(RED)
    c.drawCentredString(W/2, H/2 + 10*mm, 'Guia Futbol TV')
    # Subtitle
    c.setFillColor(GRAY)
    c.setFont('Helvetica', 12)
    c.drawCentredString(W/2, H/2 - 30*mm, 'Widget de programación futbolistica para Mundo Deportivo')
    # Bottom
    c.setFont('Helvetica', 9)
    c.setFillColor(HexColor('#444444'))
    c.drawCentredString(W/2, 15*mm, 'Next.js + TypeScript  |  WOSTI API  |  Datos en tiempo real')


# ═══════════════════════════════════════════════════════════════
# SLIDE 2: Vista principal
# ═══════════════════════════════════════════════════════════════
def slide_main_view(c):
    draw_bg(c)
    draw_header(c)
    draw_slide_num(c, 1, 'VISTA PRINCIPAL')
    by = draw_title(c, 'Partidos del dia con marcadores en vivo')
    by = draw_desc(c, 'Vista principal mostrando todos los partidos de hoy, agrupados por competición, con marcadores en tiempo real y canales de TV con colores corporativos.', by - 8*mm)
    # Simulated matches
    y = by - 12*mm
    # Comp header
    c.setFillColor(RED)
    c.rect(30*mm, y, 55*mm, 6*mm, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont('Helvetica-Bold', 8)
    c.drawString(32*mm, y + 1.5*mm, 'LALIGA EA SPORTS')
    y -= 18*mm
    draw_match_row(c, '19:00', 'FC Barcelona', 'Atletico Madrid', 'LaLiga EA Sports', ['DAZN LaLiga', 'M+ LaLiga'], y, (2, 1), 'HT')
    y -= 18*mm
    draw_match_row(c, '21:00', 'Real Madrid', 'Sevilla FC', 'LaLiga EA Sports', ['DAZN LaLiga'], y, (1, 0), 'LIVE')
    y -= 18*mm
    # Amistoso header
    c.setFillColor(RED)
    c.rect(30*mm, y + 8*mm, 30*mm, 6*mm, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont('Helvetica-Bold', 8)
    c.drawString(32*mm, y + 9.5*mm, 'AMISTOSO')
    y -= 4*mm
    draw_match_row(c, '20:00', 'España', 'Serbia', 'Amistoso', ['La 1 TVE', 'RTVE Play'], y)


# ═══════════════════════════════════════════════════════════════
# SLIDE 3: Navegacion + Filtros
# ═══════════════════════════════════════════════════════════════
def slide_navigation(c):
    draw_bg(c)
    draw_header(c)
    draw_slide_num(c, 2, 'NAVEGACION Y FILTROS')
    by = draw_title(c, 'Consulta cualquier dia y filtra por canal, competición o equipo')
    by = draw_desc(c, 'Navega 7 dias de programación. Filtra por canales en abierto (La 1, Gol TV, Antena 3) o de pago (DAZN, Movistar+). Filtra por competición o equipo.', by - 8*mm)
    y = by - 12*mm
    # Day buttons
    days = ['AYER', 'HOY', 'MANANA', 'VIE 10', 'SAB 11', 'DOM 12', 'LUN 13']
    x = 30*mm
    for i, d in enumerate(days):
        active = i == 1
        c.setFillColor(RED if active else HexColor('#222222'))
        c.roundRect(x, y, 22*mm, 7*mm, 1*mm, fill=1, stroke=0)
        c.setFillColor(WHITE if active else GRAY)
        c.setFont('Helvetica-Bold' if active else 'Helvetica', 8)
        c.drawCentredString(x + 11*mm, y + 2*mm, d)
        x += 24*mm
    y -= 14*mm
    # Filter buttons
    filters = ['TODOS', 'EN ABIERTO', 'DE PAGO']
    x = 30*mm
    for i, f in enumerate(filters):
        active = i == 0
        c.setFillColor(RED if active else HexColor('#222222'))
        c.roundRect(x, y, 28*mm, 7*mm, 1*mm, fill=1, stroke=0)
        c.setFillColor(WHITE if active else GRAY)
        c.setFont('Helvetica-Bold' if active else 'Helvetica', 8)
        c.drawCentredString(x + 14*mm, y + 2*mm, f)
        x += 30*mm
    # Selects
    c.setFillColor(HexColor('#222222'))
    c.roundRect(x + 5*mm, y, 35*mm, 7*mm, 1*mm, fill=1, stroke=0)
    c.setFillColor(GRAY)
    c.setFont('Helvetica', 8)
    c.drawString(x + 8*mm, y + 2*mm, 'Competicion')
    c.setFillColor(HexColor('#222222'))
    c.roundRect(x + 43*mm, y, 30*mm, 7*mm, 1*mm, fill=1, stroke=0)
    c.setFillColor(GRAY)
    c.drawString(x + 46*mm, y + 2*mm, 'Equipo')
    y -= 18*mm
    # Feature cards
    features_left = [
        ('7 dias', 'Ayer, hoy, mañana y hasta 7 dias de programación futbolistica'),
        ('En abierto / De pago', 'Filtra por tipo de emision: canales gratuitos o plataformas de pago'),
    ]
    features_right = [
        ('Por competición', 'LaLiga, Champions, Copa del Rey, Amistosos y mas'),
        ('Por equipo', 'Encuentra todos los partidos de tu equipo favorito'),
    ]
    for i, (title, desc) in enumerate(features_left):
        fy = y - i * 22*mm
        draw_card(c, 30*mm, fy - 5*mm, (W - 60*mm) / 2 - 3*mm, 18*mm)
        c.setFillColor(WHITE)
        c.setFont('Helvetica-Bold', 10)
        c.drawString(34*mm, fy + 6*mm, title)
        c.setFillColor(GRAY)
        c.setFont('Helvetica', 8)
        c.drawString(34*mm, fy - 1*mm, desc[:60])

    for i, (title, desc) in enumerate(features_right):
        fy = y - i * 22*mm
        rx = 30*mm + (W - 60*mm) / 2 + 3*mm
        draw_card(c, rx, fy - 5*mm, (W - 60*mm) / 2 - 3*mm, 18*mm)
        c.setFillColor(WHITE)
        c.setFont('Helvetica-Bold', 10)
        c.drawString(rx + 4*mm, fy + 6*mm, title)
        c.setFillColor(GRAY)
        c.setFont('Helvetica', 8)
        c.drawString(rx + 4*mm, fy - 1*mm, desc[:60])


# ═══════════════════════════════════════════════════════════════
# SLIDE 4: Clasificación
# ═══════════════════════════════════════════════════════════════
def slide_classification(c):
    draw_bg(c)
    draw_header(c)
    draw_slide_num(c, 3, 'PAGINAS DE COMPETICION')
    by = draw_title(c, 'Clasificación completa con zonas y forma')
    by = draw_desc(c, 'Cada competición tiene su pagina con tabla de clasificacion, zonas de color (Champions, Europa League, descenso) e indicadores de forma reciente.', by - 8*mm)
    y = by - 10*mm
    # Legend
    legends = [('#1a3a1a', 'Champions'), ('#1a2a3a', 'Europa L.'), ('#2a2a1a', 'Conference'), ('#2a1a1a', 'Descenso')]
    x = 30*mm
    for color, label in legends:
        c.setFillColor(HexColor(color))
        c.rect(x, y, 4*mm, 4*mm, fill=1, stroke=0)
        c.setFillColor(GRAY)
        c.setFont('Helvetica', 7)
        c.drawString(x + 5*mm, y + 1*mm, label)
        x += 25*mm
    y -= 10*mm
    # Table header
    cols = ['#', 'Equipo', 'PJ', 'G', 'E', 'P', 'DG', 'Pts']
    col_x = [30*mm, 40*mm, 100*mm, 115*mm, 128*mm, 141*mm, 154*mm, 175*mm]
    c.setFillColor(GRAY)
    c.setFont('Helvetica-Bold', 8)
    for i, col in enumerate(cols):
        c.drawString(col_x[i], y, col)
    c.setStrokeColor(WHITE)
    c.setLineWidth(1)
    c.line(30*mm, y - 2*mm, 190*mm, y - 2*mm)
    y -= 10*mm
    # Table rows
    table = [
        (1, 'FC Barcelona', 30, 22, 6, 2, '+40', 72, ZONE_CHAMPIONS, ['W', 'W', 'D', 'W', 'W']),
        (2, 'Real Madrid', 30, 21, 5, 4, '+30', 68, ZONE_CHAMPIONS, ['W', 'L', 'W', 'W', 'D']),
        (3, 'Atletico Madrid', 30, 18, 6, 6, '+17', 60, ZONE_CHAMPIONS, ['W', 'W', 'W', 'D', 'L']),
        (4, 'Athletic Club', 30, 15, 9, 6, '+7', 54, ZONE_CHAMPIONS, ['D', 'W', 'D', 'W', 'W']),
        (5, 'Villarreal', 30, 14, 9, 7, '+8', 51, ZONE_EUROPA, ['L', 'W', 'W', 'D', 'W']),
        (6, 'Real Sociedad', 30, 14, 7, 9, '+4', 49, ZONE_EUROPA, ['W', 'L', 'D', 'W', 'L']),
        (7, 'Sevilla FC', 30, 12, 9, 9, '-1', 45, ZONE_CONFERENCE, ['D', 'L', 'W', 'D', 'W']),
    ]
    for pos, team, pj, g, e, p, dg, pts, zone, form in table:
        c.setFillColor(zone)
        c.rect(28*mm, y - 2*mm, 165*mm, 8*mm, fill=1, stroke=0)
        pc = HexColor('#166534') if pos <= 4 else GRAY
        c.setFillColor(pc)
        c.setFont('Helvetica-Bold', 9)
        c.drawString(col_x[0], y, str(pos))
        c.setFillColor(WHITE)
        c.setFont('Helvetica-Bold', 9)
        c.drawString(col_x[1], y, team)
        c.setFillColor(GRAY)
        c.setFont('Helvetica', 9)
        for j, v in enumerate([pj, g, e, p]):
            c.drawString(col_x[2 + j], y, str(v))
        dgc = HexColor('#166534') if dg.startswith('+') else RED
        c.setFillColor(dgc)
        c.setFont('Helvetica-Bold', 9)
        c.drawString(col_x[6], y, dg)
        c.setFillColor(WHITE)
        c.setFont('Helvetica-Bold', 10)
        c.drawString(col_x[7], y, str(pts))
        # Form dots
        fx = 195*mm
        for f in form:
            fc = GREEN_W if f == 'W' else YELLOW_D if f == 'D' else RED_L
            c.setFillColor(fc)
            c.circle(fx, y + 2*mm, 2.5*mm, fill=1, stroke=0)
            c.setFillColor(WHITE)
            c.setFont('Helvetica-Bold', 6)
            c.drawCentredString(fx, y + 1*mm, f)
            fx += 6*mm
        y -= 10*mm
    c.setFillColor(GRAY)
    c.setFont('Helvetica', 8)
    c.drawString(30*mm, y, '... y 13 equipos mas')


# ═══════════════════════════════════════════════════════════════
# SLIDE 5: Resultados y Proximos
# ═══════════════════════════════════════════════════════════════
def slide_results(c):
    draw_bg(c)
    draw_header(c)
    draw_slide_num(c, 4, 'RESULTADOS Y PROXIMOS')
    by = draw_title(c, 'Histórico de resultados y próximos partidos')
    by = draw_desc(c, 'Cada competición incluye pestañas con los ultimos resultados y los próximos partidos programados, incluyendo el canal donde se emiten.', by - 8*mm)
    y = by - 10*mm
    # Tabs
    tabs = [('CLASIFICACION', False), ('RESULTADOS', True), ('PROXIMOS', False)]
    x = 30*mm
    for label, active in tabs:
        tw = c.stringWidth(label, 'Helvetica-Bold', 9) + 8*mm
        c.setFillColor(RED if active else HexColor('#1a1a1a'))
        c.rect(x, y, tw, 7*mm, fill=1, stroke=0)
        c.setFillColor(WHITE if active else GRAY)
        c.setFont('Helvetica-Bold', 9)
        c.drawString(x + 4*mm, y + 2*mm, label)
        x += tw + 1*mm
    y -= 14*mm
    # Results
    results = [
        ('Sab 22 Mar', 'FC Barcelona', 3, 1, 'Getafe CF'),
        ('Sab 22 Mar', 'Real Madrid', 2, 0, 'Celta de Vigo'),
        ('Jue 27 Mar', 'Valencia CF', 2, 1, 'Getafe CF'),
        ('Jue 27 Mar', 'Osasuna', 0, 0, 'Rayo Vallecano'),
    ]
    for i, (date, home, sh, sa, away) in enumerate(results):
        bg = HexColor('#161616') if i % 2 else CARD_BG
        c.setFillColor(bg)
        c.rect(30*mm, y - 3*mm, W - 60*mm, 10*mm, fill=1, stroke=0)
        c.setFillColor(GRAY)
        c.setFont('Helvetica', 8)
        c.drawString(32*mm, y, date)
        c.setFillColor(WHITE)
        c.setFont('Helvetica-Bold', 10)
        c.drawRightString(110*mm, y, home)
        c.setFont('Helvetica-Bold', 12)
        c.drawCentredString(120*mm, y, f'{sh} - {sa}')
        c.setFont('Helvetica-Bold', 10)
        c.drawString(130*mm, y, away)
        y -= 12*mm
    y -= 5*mm
    # Proximos section
    tabs2 = [('CLASIFICACION', False), ('RESULTADOS', False), ('PROXIMOS', True)]
    x = 30*mm
    for label, active in tabs2:
        tw = c.stringWidth(label, 'Helvetica-Bold', 9) + 8*mm
        c.setFillColor(RED if active else HexColor('#1a1a1a'))
        c.rect(x, y, tw, 7*mm, fill=1, stroke=0)
        c.setFillColor(WHITE if active else GRAY)
        c.setFont('Helvetica-Bold', 9)
        c.drawString(x + 4*mm, y + 2*mm, label)
        x += tw + 1*mm
    y -= 14*mm
    nexts = [
        ('Vie 28 19:00', 'FC Barcelona', 'Atletico Madrid', 'DAZN LaLiga'),
        ('Vie 28 21:00', 'Real Madrid', 'Sevilla FC', 'DAZN LaLiga'),
        ('Sab 29 16:15', 'Athletic Club', 'Villarreal', 'DAZN'),
    ]
    for date, home, away, tv in nexts:
        c.setFillColor(RED)
        c.rect(28*mm, y - 3*mm, 1*mm, 10*mm, fill=1, stroke=0)
        c.setFillColor(RED)
        c.setFont('Helvetica-Bold', 8)
        c.drawString(32*mm, y, date)
        c.setFillColor(WHITE)
        c.setFont('Helvetica-Bold', 10)
        c.drawRightString(110*mm, y, home)
        c.setFillColor(GRAY)
        c.setFont('Helvetica', 9)
        c.drawCentredString(117*mm, y + 0.5*mm, 'vs')
        c.setFillColor(WHITE)
        c.setFont('Helvetica-Bold', 10)
        c.drawString(124*mm, y, away)
        draw_ch_tag(c, tv, 185*mm, y)
        y -= 12*mm


# ═══════════════════════════════════════════════════════════════
# SLIDE 6: Objetivo de producto
# ═══════════════════════════════════════════════════════════════
def slide_objective(c):
    draw_bg(c)
    draw_header(c)
    draw_slide_num(c, 5, 'OBJETIVO DE PRODUCTO')
    by = draw_title(c, 'Convertir MD en la referencia de programación futbolistica')
    by = draw_desc(c, 'Un widget que genera trafico recurrente, fideliza al usuario y posiciona a Mundo Deportivo como utilidad diaria, no solo medio informativo.', by - 8*mm)
    y = by - 12*mm
    # Problem card
    draw_card(c, 25*mm, y - 42*mm, W/2 - 30*mm, 45*mm)
    c.setFillColor(WHITE)
    c.setFont('Helvetica-BoldOblique', 12)
    c.drawString(29*mm, y - 2*mm, 'El problema que resolvemos')
    c.setFillColor(LIGHT_GRAY)
    c.setFont('Helvetica', 8)
    lines = [
        'Millones buscan cada dia "donde ver el partido"',
        'y acaban en paginas de terceros.',
        '',
        'Las búsquedas son recurrentes: el usuario',
        'vuelve cada jornada, cada Champions.',
        '',
        'Ningún medio ofrece una experiencia',
        'experiencia dedicada para esto.',
    ]
    ly = y - 12*mm
    for l in lines:
        if 'donde ver' in l:
            c.setFillColor(RED)
            c.setFont('Helvetica-Bold', 8)
        else:
            c.setFillColor(LIGHT_GRAY)
            c.setFont('Helvetica', 8)
        c.drawString(29*mm, ly, l)
        ly -= 4.5*mm
    # Engagement model
    rx = W/2 + 2*mm
    draw_card(c, rx, y - 42*mm, W/2 - 27*mm, 45*mm)
    c.setFillColor(WHITE)
    c.setFont('Helvetica-BoldOblique', 12)
    c.drawString(rx + 4*mm, y - 2*mm, 'Modelo de engagement')
    steps = [
        ('Busqueda', '"donde ver Barca"'),
        ('Widget Guia TV', 'Respuesta inmediata'),
        ('Contenido MD', 'Previa, crónica'),
        ('Retención', 'Vuelve mañana'),
    ]
    sx = rx + 6*mm
    sy = y - 16*mm
    for i, (title, desc) in enumerate(steps):
        c.setFillColor(HexColor('#1a1a1a'))
        c.roundRect(sx, sy - 3*mm, 28*mm, 14*mm, 2*mm, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont('Helvetica-Bold', 8)
        c.drawCentredString(sx + 14*mm, sy + 5*mm, title)
        c.setFillColor(GRAY)
        c.setFont('Helvetica', 6)
        c.drawCentredString(sx + 14*mm, sy - 0.5*mm, desc)
        if i < 3:
            c.setFillColor(RED)
            c.setFont('Helvetica-Bold', 12)
            c.drawCentredString(sx + 31*mm, sy + 3*mm, '>')
        sx += 32*mm
    c.setFillColor(GRAY)
    c.setFont('Helvetica', 7)
    c.drawCentredString(rx + (W/2 - 27*mm)/2, y - 38*mm, 'De la utilidad al habito. Del habito a la fidelidad.')
    # KPIs
    y = y - 52*mm
    draw_card(c, 25*mm, y - 15*mm, W - 50*mm, 18*mm)
    c.setFillColor(WHITE)
    c.setFont('Helvetica-BoldOblique', 11)
    c.drawString(29*mm, y - 1*mm, 'KPIs objetivo')
    mx = 29*mm
    my = y - 10*mm
    for m in ['+30% visitas recurrentes', 'Top 3 "futbol TV hoy"', '-40% bounce rate', '+2 paginas/sesion', 'Widget embeddable']:
        mx = draw_metric(c, m, mx, my)


# ═══════════════════════════════════════════════════════════════
# SLIDE 7: SEO
# ═══════════════════════════════════════════════════════════════
def slide_seo(c):
    draw_bg(c)
    draw_header(c)
    draw_slide_num(c, 6, 'ESTRATEGIA SEO')
    by = draw_title(c, 'Capturar el trafico de búsqueda de programación deportiva')
    by = draw_desc(c, 'Cada pagina del widget es una landing optimizada para keywords de alta intención y alto volumen de búsqueda recurrente.', by - 8*mm)
    y = by - 10*mm
    # Cluster 1 header
    draw_card(c, 25*mm, y - 70*mm, W/2 - 28*mm, 73*mm)
    c.setFillColor(WHITE)
    c.setFont('Helvetica-BoldOblique', 11)
    c.drawString(29*mm, y - 2*mm, '"FUTBOL EN TV" — SEMrush')
    mx = 29*mm
    my = y - 10*mm
    for m in ['15.915 kw', '450K vol./mes', 'KD 43%']:
        mx = draw_metric(c, m, mx, my)
    # Top keywords
    kws = [
        ('"futbol hoy tv"', '60.500'),
        ('"futbol libre tv"', '49.500'),
        ('"futbol hoy en tv"', '33.100'),
        ('"futbol tv"', '22.200'),
        ('"futbol en la tv"', '18.100'),
        ('"futbol tv hoy"', '18.100'),
    ]
    ky = y - 22*mm
    for kw, vol in kws:
        c.setFillColor(WHITE)
        c.setFont('Helvetica', 8)
        c.drawString(31*mm, ky, kw)
        c.setFillColor(NEON)
        c.setFont('Helvetica-Bold', 8)
        c.drawRightString(W/2 - 8*mm, ky, vol + '/mes')
        ky -= 7*mm
    # Cluster 2
    rx = W/2 - 1*mm
    draw_card(c, rx, y - 70*mm, W/2 - 24*mm, 73*mm)
    c.setFillColor(WHITE)
    c.setFont('Helvetica-BoldOblique', 11)
    c.drawString(rx + 4*mm, y - 2*mm, '"PARTIDOS HOY EN TV"')
    mx = rx + 4*mm
    my = y - 10*mm
    for m in ['498 kw', '17.6K vol./mes', 'KD 53%']:
        mx = draw_metric(c, m, mx, my)
    kws2 = [
        ('"partidos de futbol hoy en tv"', '4.400'),
        ('"partidos en tv hoy"', '1.900'),
        ('"que partido televisan hoy"', '1.600'),
        ('"partidos de hoy en tv"', '1.300'),
        ('"partidos hoy en tv"', '1.300'),
        ('"partido en abierto gol tv"', '1.000'),
    ]
    ky = y - 22*mm
    for kw, vol in kws2:
        c.setFillColor(WHITE)
        c.setFont('Helvetica', 8)
        c.drawString(rx + 6*mm, ky, kw)
        c.setFillColor(NEON)
        c.setFont('Helvetica-Bold', 8)
        c.drawRightString(W - 30*mm, ky, vol + '/mes')
        ky -= 7*mm
    # Total opportunity
    y = y - 78*mm
    draw_card(c, 25*mm, y - 12*mm, W - 50*mm, 15*mm, RED)
    c.setFillColor(NEON)
    c.setFont('Helvetica-BoldOblique', 12)
    c.drawString(29*mm, y - 1*mm, 'Oportunidad total: +600K búsquedas/mes')
    c.setFillColor(WHITE)
    c.setFont('Helvetica', 8)
    c.drawString(29*mm, y - 9*mm, 'Trafico que hoy se reparte entre futbolenlatv.es, resultados-futbol.com y agregadores sin marca editorial.')


# ═══════════════════════════════════════════════════════════════
# SLIDE 8: SEO Structure
# ═══════════════════════════════════════════════════════════════
def slide_seo_structure(c):
    draw_bg(c)
    draw_header(c)
    draw_slide_num(c, 7, 'ESTRUCTURA SEO')
    by = draw_title(c, 'Arquitectura de URLs optimizada por capas')
    y = by - 15*mm
    # URL structure
    urls = [
        ('/futbol/tv/hoy', 'Landing principal', 'Captura "futbol TV hoy", "partidos hoy", "que partido hay hoy"'),
        ('/futbol/tv/laliga', 'Pagina de competición', 'Captura "LaLiga TV", "donde ver LaLiga", "horario LaLiga"'),
        ('/futbol/tv/real-madrid', 'Widget de equipo', 'Captura "donde ver Real Madrid", "próximo partido Real Madrid TV"'),
        ('/futbol/tv/champions', 'Pagina Champions', 'Picos estacionales de 200K+ búsquedas en semana de Champions'),
    ]
    for url, title, desc in urls:
        draw_card(c, 25*mm, y - 14*mm, W - 50*mm, 17*mm)
        c.setFillColor(RED)
        c.circle(29*mm, y - 3*mm, 1.5*mm, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont('Helvetica-Bold', 10)
        c.drawString(33*mm, y - 2*mm, url)
        c.setFillColor(GRAY)
        c.setFont('Helvetica', 8)
        c.drawString(33*mm, y - 10*mm, f'{title} — {desc}')
        y -= 22*mm
    y -= 5*mm
    # Rich snippets note
    draw_card(c, 25*mm, y - 14*mm, W - 50*mm, 17*mm, RED)
    c.setFillColor(WHITE)
    c.setFont('Helvetica-BoldOblique', 10)
    c.drawString(29*mm, y - 2*mm, 'Rich Snippets con Event Schema')
    c.setFillColor(LIGHT_GRAY)
    c.setFont('Helvetica', 8)
    c.drawString(29*mm, y - 10*mm, 'Cada URL genera rich snippets con datos estructurados, apareciendo en Google con hora, canal y equipos.')
    # Clusters
    y -= 28*mm
    c.setFillColor(WHITE)
    c.setFont('Helvetica-BoldOblique', 11)
    c.drawString(25*mm, y, 'Clusters de intención (concordancia amplia)')
    y -= 10*mm
    clusters = [('vivo', '1.274'), ('ver', '1.254'), ('gratis', '556'), ('directo', '395'), ('hoy', '395'), ('partido', '243'), ('movistar', '202'), ('canal', '149')]
    cx = 25*mm
    for label, count in clusters:
        cw = 26*mm
        c.setFillColor(HexColor('#1a1a1a'))
        c.setStrokeColor(HexColor('#333333'))
        c.roundRect(cx, y - 3*mm, cw, 12*mm, 2*mm, fill=1, stroke=1)
        c.setFillColor(WHITE)
        c.setFont('Helvetica-Bold', 9)
        c.drawString(cx + 3*mm, y + 3*mm, label)
        c.setFillColor(NEON)
        c.setFont('Helvetica-Bold', 8)
        c.drawString(cx + 3*mm, y - 2*mm, count + ' kw')
        cx += cw + 2*mm


# ═══════════════════════════════════════════════════════════════
# SLIDE 9: Widgets de equipo
# ═══════════════════════════════════════════════════════════════
def slide_widgets(c):
    draw_bg(c)
    draw_header(c)
    draw_slide_num(c, 8, 'WIDGETS DE EQUIPO')
    by = draw_title(c, 'Un widget dedicado para cada equipo que enriquece toda la web')
    by = draw_desc(c, 'Cada pagina de equipo en MD puede incluir un widget embebido con los próximos partidos televisados, canales y horarios.', by - 8*mm)
    y = by - 10*mm
    # Team widgets
    teams = [
        ('B', '#A50044', '#004D98', 'FC Barcelona', [('19:00', 'Barcelona vs Atletico', 'DAZN'), ('21:00', 'Sevilla vs Barcelona', 'M+ LaLiga'), ('18:45', 'Barcelona vs Bayern', 'UCL')]),
        ('RM', '#FEBE10', '#00529F', 'Real Madrid', [('21:00', 'R. Madrid vs Sevilla', 'DAZN'), ('16:15', 'Celta vs R. Madrid', 'LaLiga TV'), ('21:00', 'R. Madrid vs Man City', 'UCL')]),
        ('ATM', '#CE1126', '#272E61', 'Atletico Madrid', [('19:00', 'Barcelona vs Atletico', 'DAZN'), ('21:00', 'Atletico vs Betis', 'M+ LaLiga')]),
        ('ATH', '#EE2523', '#1a1a1a', 'Athletic Club', [('16:15', 'Athletic vs Villarreal', 'DAZN'), ('19:00', 'R. Sociedad vs Athletic', 'M+ LaLiga')]),
    ]
    cw = (W - 56*mm) / 2
    for idx, (abbr, c1, c2, name, matches) in enumerate(teams):
        col = idx % 2
        row = idx // 2
        x = 25*mm + col * (cw + 6*mm)
        cy = y - row * 48*mm
        # Card
        draw_card(c, x, cy - 42*mm, cw, 45*mm)
        # Header with gradient dot
        c.setFillColor(HexColor(c1))
        c.circle(x + 8*mm, cy - 3*mm, 5*mm, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont('Helvetica-Bold', 7)
        c.drawCentredString(x + 8*mm, cy - 5*mm, abbr)
        c.setFillColor(WHITE)
        c.setFont('Helvetica-Bold', 11)
        c.drawString(x + 16*mm, cy - 5*mm, name)
        # Matches
        my = cy - 15*mm
        for time, teams_str, tv in matches:
            c.setFillColor(RED)
            c.setFont('Helvetica-BoldOblique', 8)
            c.drawString(x + 4*mm, my, time)
            c.setFillColor(LIGHT_GRAY)
            c.setFont('Helvetica', 8)
            c.drawString(x + 20*mm, my, teams_str)
            draw_ch_tag(c, tv, x + cw - 25*mm, my)
            my -= 8*mm
        # Footer
        c.setFillColor(HexColor('#444444'))
        c.setFont('Helvetica', 6)
        url = f'mundodeportivo.com/futbol/{name.lower().replace(" ", "-")}'
        c.drawCentredString(x + cw/2, cy - 39*mm, url)


# ═══════════════════════════════════════════════════════════════
# SLIDE 10: Donde embeber
# ═══════════════════════════════════════════════════════════════
def slide_embed(c):
    draw_bg(c)
    draw_header(c)
    draw_slide_num(c, 9, 'INTEGRACION')
    by = draw_title(c, 'Donde se embeben estos widgets')
    y = by - 15*mm
    embeds = [
        ('Pagina de equipo', 'Sidebar o modulo dentro de la ficha de cada equipo. El lector ve de un vistazo cuando y donde ver el próximo partido.'),
        ('Previas de partido', 'En cada articulo de previa se inserta automáticamente el widget con canal y hora. Cero esfuerzo editorial.'),
        ('Homepage / Portada', 'Modulo destacado "Partidos de hoy en TV" que rota segun la programación del dia.'),
        ('App movil', 'Notificaciones push "Tu equipo juega en 30 min" con deep link al widget.'),
        ('Newsletter', 'Bloque automatico "Esta semana en TV" en los emails diarios de MD.'),
    ]
    for title, desc in embeds:
        draw_card(c, 25*mm, y - 14*mm, W - 50*mm, 17*mm)
        c.setFillColor(RED)
        c.circle(29*mm, y - 3*mm, 1.5*mm, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont('Helvetica-Bold', 10)
        c.drawString(33*mm, y - 2*mm, title)
        c.setFillColor(GRAY)
        c.setFont('Helvetica', 8)
        c.drawString(33*mm, y - 10*mm, desc[:100])
        y -= 21*mm
    # Value card
    y -= 5*mm
    draw_card(c, 25*mm, y - 30*mm, W - 50*mm, 33*mm, RED)
    c.setFillColor(WHITE)
    c.setFont('Helvetica-BoldOblique', 12)
    c.drawString(29*mm, y - 2*mm, 'Valor para el negocio')
    values = [
        'Contenido siempre fresco — widgets se actualizan automáticamente via API',
        'SEO long-tail masivo — cada equipo genera su propia landing',
        'Monetización — espacio premium para patrocinadores de broadcasting',
        'Diferenciación — ningún competidor (Marca, AS, Sport) tiene esto',
    ]
    vy = y - 11*mm
    for v in values:
        c.setFillColor(NEON)
        c.circle(31*mm, vy + 1*mm, 1*mm, fill=1, stroke=0)
        c.setFillColor(LIGHT_GRAY)
        c.setFont('Helvetica', 8)
        c.drawString(35*mm, vy, v)
        vy -= 6*mm


# ═══════════════════════════════════════════════════════════════
# BUILD PDF
# ═══════════════════════════════════════════════════════════════
def main():
    c_pdf = canvas.Canvas(OUTPUT, pagesize=landscape(A4))
    c_pdf.setTitle('Guía Fútbol TV - Pitch')
    c_pdf.setAuthor('Mundo Deportivo')

    slides = [
        slide_cover,
        slide_main_view,
        slide_navigation,
        slide_classification,
        slide_results,
        slide_objective,
        slide_seo,
        slide_seo_structure,
        slide_widgets,
        slide_embed,
    ]

    for i, slide_fn in enumerate(slides):
        slide_fn(c_pdf)
        if i < len(slides) - 1:
            c_pdf.showPage()

    c_pdf.save()
    print(f'PDF generado: {OUTPUT}')
    print(f'Total slides: {len(slides)}')


if __name__ == '__main__':
    main()
