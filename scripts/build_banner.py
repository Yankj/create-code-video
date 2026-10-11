#!/usr/bin/env python3
"""Generate the original README banner as editable SVG. No external assets."""
from pathlib import Path
import random

root = Path(__file__).resolve().parents[1]
rng = random.Random(417)
particles = []
for i in range(155):
    x=rng.uniform(700, 964)
    y=235 + 45*((x-830)/145)**2 + rng.gauss(0,27)
    particles.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{rng.uniform(1,3):.1f}" fill="{rng.choice(["#d6fa78","#b8f4d7","#ff6c44"])}" opacity="{rng.uniform(.35,.9):.2f}"/>')
svg = '''<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="460" viewBox="0 0 1280 460" role="img" aria-labelledby="title desc">
<title id="title">Create Code Video — Ideas in motion. Built with code.</title>
<desc id="desc">An original code-drawn banner: a causal particle path connects an orbit to a completed frame.</desc>
<defs>
 <linearGradient id="bg" x2="1" y2="1"><stop stop-color="#0c1420"/><stop offset="1" stop-color="#17313a"/></linearGradient>
 <radialGradient id="halo"><stop stop-color="#3c6b67" stop-opacity=".52"/><stop offset="1" stop-color="#15333c" stop-opacity="0"/></radialGradient>
 <linearGradient id="line"><stop stop-color="#ff6c44"/><stop offset="1" stop-color="#d6fa78"/></linearGradient>
 <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#b8f4d7" stroke-opacity=".035"/></pattern>
</defs>
<rect width="1280" height="460" rx="24" fill="url(#bg)"/>
<rect width="1280" height="460" rx="24" fill="url(#grid)"/>
<ellipse cx="925" cy="244" rx="330" ry="260" fill="url(#halo)"/>
<g font-family="Arial, Helvetica, sans-serif">
 <g transform="translate(60 48)"><rect width="36" height="36" rx="10" fill="#223d43"/><path d="m12 10 13 8-13 8Z" fill="#d6fa78"/><text x="52" y="25" fill="#b8f4d7" font-size="16" font-weight="700" letter-spacing="2.5">CREATE CODE VIDEO</text></g>
 <text x="60" y="176" fill="#f5f2e8" font-size="64" font-weight="700" letter-spacing="-2.5">Ideas in motion.</text>
 <text x="60" y="252" fill="#d6fa78" font-size="64" font-weight="700" letter-spacing="-2.5">Built with code.</text>
 <text x="63" y="302" fill="#9cb7bc" font-size="22">Direct the story. Render the result.</text>
 <g transform="translate(60 355)" font-size="13" font-weight="700" letter-spacing="1">
  <rect width="118" height="34" rx="17" fill="#263e43"/><text x="21" y="22" fill="#b8f4d7">NARRATIVE</text>
  <rect x="132" width="93" height="34" rx="17" fill="#263e43"/><text x="157" y="22" fill="#b8f4d7">MOTION</text>
  <rect x="239" width="129" height="34" rx="17" fill="#263e43"/><text x="257" y="22" fill="#b8f4d7">REAL EXPORT</text>
 </g>
</g>
<path d="M697 293C760 205 886 214 1026 230" stroke="url(#line)" stroke-width="2" fill="none" stroke-dasharray="4 8" opacity=".5"/>
''' + '\n'.join(particles) + '''
<g transform="translate(818 228)" fill="none" stroke="#b8f4d7" stroke-width="1.3" opacity=".75">
 <circle r="64"/><ellipse rx="25" ry="64" transform="rotate(-30)"/><ellipse rx="46" ry="64" transform="rotate(35)"/><ellipse rx="64" ry="19" transform="rotate(-22)"/><ellipse rx="64" ry="42" transform="rotate(27)"/>
</g>
<g transform="translate(1024 89) rotate(5 86 146)">
 <rect x="8" y="12" width="172" height="292" rx="20" fill="#08131a" opacity=".4"/>
 <rect width="172" height="292" rx="20" fill="#f5f2e8"/>
 <rect x="16" y="18" width="140" height="163" rx="10" fill="#142d36"/>
 <circle cx="86" cy="98" r="40" fill="none" stroke="#b8f4d7" stroke-width="1"/>
 <path d="m68 74 42 24-42 24Z" fill="#d6fa78"/>
 <path d="M22 205H115M22 218H142" stroke="#0c1420" stroke-width="5" stroke-linecap="round"/>
 <rect x="20" y="241" width="28" height="28" rx="8" fill="#b8f4d7"/>
 <path d="m26 254 6 6 11-14" stroke="#0c1420" stroke-width="2" fill="none"/>
 <text x="59" y="261" font-family="Arial, sans-serif" font-size="14" fill="#36535b" font-weight="700">VERIFIED</text>
</g>
<text x="762" y="368" font-family="monospace" font-size="12" letter-spacing="2" fill="#728f96">SEED → SEEK → SHIP</text>
</svg>'''
(root/'assets/banner.svg').write_text(svg+'\n',encoding='utf-8')
print('assets/banner.svg generated')
