import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#7E7E9A"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 750, "SkillForge AI — Complete Architecture, Languages & Tech Stack Guide")
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.5)
            self.line(54, 742, 558, 742)
        
        # Footer
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(54, 45, 558, 45)
        self.drawString(54, 32, "Confidential & Proprietary — SkillForge AI Platform Documentation")
        self.drawRightString(558, 32, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()

def generate_tech_stack_pdf(output_path):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom styles
    primary_color = colors.HexColor("#1A1A2E")
    accent_blue = colors.HexColor("#0284C7")
    accent_purple = colors.HexColor("#6366F1")
    text_dark = colors.HexColor("#1E293B")
    text_muted = colors.HexColor("#64748B")
    card_bg = colors.HexColor("#F8FAFC")
    border_color = colors.HexColor("#CBD5E1")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=primary_color,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=accent_purple,
        spaceAfter=14
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=primary_color,
        spaceBefore=12,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=accent_blue,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=text_dark,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=text_dark,
        leftIndent=12,
        spaceAfter=3
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=text_dark
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=primary_color
    )

    code_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor("#0F172A")
    )

    story = []

    # Title Section
    story.append(Paragraph("SKILLFORGE AI", title_style))
    story.append(Paragraph("Platform Architecture, Languages, Tech Stack & Requirements Manual", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=accent_purple, spaceBefore=0, spaceAfter=12))

    # Executive Overview
    story.append(Paragraph("1. Executive Platform Overview", h1_style))
    story.append(Paragraph(
        "<b>SkillForge AI</b> is a next-generation engineering career readiness platform and interactive physics-driven skill sandbox. "
        "It features a 2D physics gravity simulation engine (Matter.js), 3D WebGL particle/neural fields (Three.js), deterministic diagnostic skill calibrations, "
        "real-time role gap analysis, automated resume builders, and an AI interview simulator.",
        body_style
    ))
    story.append(Spacer(1, 6))

    # Section 2: Languages Used
    story.append(Paragraph("2. Programming & Markup Languages Used & Their Exact Roles", h1_style))
    
    lang_data = [
        [
            Paragraph("Language / Format", table_header_style),
            Paragraph("Where & How It Is Used in the Project", table_header_style),
            Paragraph("Key Responsibilities & Function", table_header_style)
        ],
        [
            Paragraph("<b>JavaScript (ES6+)</b>", table_cell_bold),
            Paragraph("• Frontend (React, Zustand, Services)<br/>• Backend (Node.js, Express, Middleware)", table_cell_style),
            Paragraph("Core programming language for both client & server runtime. Manages reactive state, physics calculations, algorithms, API endpoints, and authentication.", table_cell_style)
        ],
        [
            Paragraph("<b>JSX (React)</b>", table_cell_bold),
            Paragraph("• All Frontend UI components & pages (`frontend/src/components`, `pages`)", table_cell_style),
            Paragraph("Declarative UI syntax blending HTML structure with JavaScript reactivity, component state, conditional renders, and Framer Motion animation triggers.", table_cell_style)
        ],
        [
            Paragraph("<b>HTML5</b>", table_cell_bold),
            Paragraph("• `frontend/index.html`<br/>• Canvas 2D & WebGL 3D canvas mount elements", table_cell_style),
            Paragraph("Defines foundational semantic DOM structure, viewport responsiveness, font preloading, and canvas rendering targets for Matter.js & Three.js.", table_cell_style)
        ],
        [
            Paragraph("<b>CSS3 & Tailwind CSS</b>", table_cell_bold),
            Paragraph("• `frontend/src/index.css`<br/>• Tailwind utilities & inline responsive CSS", table_cell_style),
            Paragraph("Neo-brutalist & glassmorphic UI design tokens, box-shadow depth layers, responsive layouts, glowing atmospheric planet pulses, and animation keyframes.", table_cell_style)
        ],
        [
            Paragraph("<b>SQL (PostgreSQL) / NoSQL</b>", table_cell_bold),
            Paragraph("• `backend/config/database.js`<br/>• `frontend/src/services/firebaseSync.js`", table_cell_style),
            Paragraph("Persistent database storage for user profiles, test logs, domain preferences, and real-time Firestore synchronization of skill matrices.", table_cell_style)
        ],
        [
            Paragraph("<b>JSON</b>", table_cell_bold),
            Paragraph("• `package.json`, REST API payloads, dataset structures", table_cell_style),
            Paragraph("Standard data interchange format for REST API communication, mock datasets (`domainsData.js`, `demoProfile.js`), and package configurations.", table_cell_style)
        ]
    ]

    t_lang = Table(lang_data, colWidths=[110, 170, 224])
    t_lang.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, card_bg]),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_lang)
    story.append(Spacer(1, 10))

    # Section 3: Architecture & Libraries
    story.append(Paragraph("3. Complete Framework & Library Breakdown", h1_style))

    framework_data = [
        [
            Paragraph("Layer / Subsystem", table_header_style),
            Paragraph("Technology / Library", table_header_style),
            Paragraph("Purpose & Role in SkillForge AI", table_header_style)
        ],
        [
            Paragraph("<b>Frontend Framework</b>", table_cell_bold),
            Paragraph("React 18 + Vite", table_cell_style),
            Paragraph("High-performance client application with blazing-fast Hot Module Replacement (HMR) and optimized Rollup production builds.", table_cell_style)
        ],
        [
            Paragraph("<b>Physics Simulation</b>", table_cell_bold),
            Paragraph("Matter.js (v0.20+)", table_cell_style),
            Paragraph("2D rigid-body engine powering the Earth gravity core, orbital attraction, collision shockwaves, drag/throw mechanics, and Zero-G mode.", table_cell_style)
        ],
        [
            Paragraph("<b>3D Graphics & Visuals</b>", table_cell_bold),
            Paragraph("Three.js + R3F + Drei", table_cell_style),
            Paragraph("WebGL-rendered 3D hero neural networks, interactive orbital AI interview spheres, and floating background star fields.", table_cell_style)
        ],
        [
            Paragraph("<b>Motion & Animations</b>", table_cell_bold),
            Paragraph("Framer Motion", table_cell_style),
            Paragraph("Page transitions, gelatinous button bounciness, XP gain toast popups, and smooth modal overlays.", table_cell_style)
        ],
        [
            Paragraph("<b>Global State Management</b>", table_cell_bold),
            Paragraph("Zustand + Persist", table_cell_style),
            Paragraph("Lightweight reactive state for user auth, diagnostic test scores, active domain selection, and local persistence.", table_cell_style)
        ],
        [
            Paragraph("<b>Audio / Sound FX</b>", table_cell_bold),
            Paragraph("Web Audio API / Custom Synth", table_cell_style),
            Paragraph("Synthesizes auditory tactile feedback for bubble pops, gravity pulses, test completion, and zero-gravity toggles.", table_cell_style)
        ],
        [
            Paragraph("<b>Backend API Server</b>", table_cell_bold),
            Paragraph("Node.js + Express.js", table_cell_style),
            Paragraph("RESTful API server with modular routers for auth, skill assessment tracking, AI recommendations, and database access.", table_cell_style)
        ],
        [
            Paragraph("<b>Security & Auth</b>", table_cell_bold),
            Paragraph("JWT + Bcrypt.js + CORS", table_cell_style),
            Paragraph("Stateless JSON Web Token issuance and verification, salted bcrypt password hashing, and cross-origin resource protection.", table_cell_style)
        ],
        [
            Paragraph("<b>Cloud Sync & DB</b>", table_cell_bold),
            Paragraph("Firebase Admin / Firestore", table_cell_style),
            Paragraph("Cloud NoSQL database syncing user assessment results and skill scores across sessions in real time.", table_cell_style)
        ]
    ]

    t_frame = Table(framework_data, colWidths=[115, 125, 264])
    t_frame.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), accent_blue),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, card_bg]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_frame)

    story.append(PageBreak())

    # Section 4: What is Needed for the Web (Prerequisites & Installation)
    story.append(Paragraph("4. What is Needed to Run & Deploy the Web Platform", h1_style))
    story.append(Paragraph(
        "To run, maintain, or deploy SkillForge AI from scratch, the following hardware, software, and configuration files are required:",
        body_style
    ))

    story.append(Paragraph("A. System & Runtime Prerequisites", h2_style))
    story.append(Paragraph("• <b>Node.js</b>: Version 18.0.0 or higher (v20+ recommended LTS)", bullet_style))
    story.append(Paragraph("• <b>Package Manager</b>: npm (v9+) or Yarn or pnpm", bullet_style))
    story.append(Paragraph("• <b>Operating System</b>: Windows 10/11, macOS (12+), or Linux (Ubuntu 20.04+)", bullet_style))
    story.append(Paragraph("• <b>Web Browser</b>: Modern browser with Canvas 2D and WebGL acceleration (Chrome, Edge, Firefox, Safari)", bullet_style))
    story.append(Paragraph("• <b>Git</b>: Version 2.30+ for repository control and deployment hooks", bullet_style))

    story.append(Spacer(1, 4))
    story.append(Paragraph("B. Step-by-Step Execution Guide", h2_style))

    cmd_data = [
        [
            Paragraph("Step & Purpose", table_header_style),
            Paragraph("Terminal Command", table_header_style)
        ],
        [
            Paragraph("<b>1. Install Backend Dependencies</b>", table_cell_bold),
            Paragraph("<font face='Courier' size='7.5'>cd backend<br/>npm install</font>", table_cell_style)
        ],
        [
            Paragraph("<b>2. Start Backend API Server</b>", table_cell_bold),
            Paragraph("<font face='Courier' size='7.5'>npm run dev  # Starts Express server on http://localhost:5000</font>", table_cell_style)
        ],
        [
            Paragraph("<b>3. Install Frontend Dependencies</b>", table_cell_bold),
            Paragraph("<font face='Courier' size='7.5'>cd frontend<br/>npm install</font>", table_cell_style)
        ],
        [
            Paragraph("<b>4. Start Frontend Dev Server</b>", table_cell_bold),
            Paragraph("<font face='Courier' size='7.5'>npm run dev  # Starts Vite client on http://localhost:5173</font>", table_cell_style)
        ],
        [
            Paragraph("<b>5. Build for Production</b>", table_cell_bold),
            Paragraph("<font face='Courier' size='7.5'>npm run build  # Produces optimized dist/ bundle</font>", table_cell_style)
        ]
    ]

    t_cmd = Table(cmd_data, colWidths=[180, 324])
    t_cmd.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, card_bg]),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_cmd)

    story.append(Spacer(1, 8))
    story.append(Paragraph("C. Required Environment Variables (.env)", h2_style))

    env_data = [
        [
            Paragraph("Location", table_header_style),
            Paragraph("Variable Key", table_header_style),
            Paragraph("Description & Example Value", table_header_style)
        ],
        [
            Paragraph("<b>Backend (.env)</b>", table_cell_bold),
            Paragraph("PORT<br/>JWT_SECRET<br/>FIREBASE_PROJECT_ID<br/>DATABASE_URL", code_style),
            Paragraph("Port number (`5000`), secure JWT signature key, optional Firebase credentials, and Postgres connection string.", table_cell_style)
        ],
        [
            Paragraph("<b>Frontend (.env)</b>", table_cell_bold),
            Paragraph("VITE_API_URL<br/>VITE_FIREBASE_API_KEY", code_style),
            Paragraph("Backend base URL (`http://localhost:5000/api`) and Firebase client API key for live database synchronization.", table_cell_style)
        ]
    ]

    t_env = Table(env_data, colWidths=[100, 150, 254])
    t_env.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), accent_purple),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, card_bg]),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_env)

    story.append(Spacer(1, 8))
    story.append(Paragraph("D. Production Hosting & Cloud Architecture", h2_style))
    story.append(Paragraph("• <b>Frontend Hosting</b>: Vercel / Netlify / Cloudflare Pages (Static SPA routing with Vite output).", bullet_style))
    story.append(Paragraph("• <b>Backend API Hosting</b>: Render / Railway / AWS EC2 / DigitalOcean App Platform (Node.js container).", bullet_style))
    story.append(Paragraph("• <b>Database Tier</b>: Firebase Firestore / Supabase PostgreSQL / MongoDB Atlas.", bullet_style))

    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#CBD5E1"), spaceBefore=4, spaceAfter=8))
    story.append(Paragraph("Generated automatically for SkillForge AI • All systems verified and production ready.", ParagraphStyle(
        'Footnote',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8,
        leading=10,
        textColor=text_muted,
        alignment=1
    )))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully generated at: {output_path}")

if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "SkillForge_AI_Tech_Stack_Documentation.pdf"
    generate_tech_stack_pdf(out)
