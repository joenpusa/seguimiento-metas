#!/usr/bin/env python3
import os
import subprocess
import markdown
from pygments.formatters import HtmlFormatter

MD_FILE = "/home/jorge/Documentos/Proyectos/Seguimiento-metas/DOCUMENTACION_API_METAS.md"
HTML_FILE = "/home/jorge/Documentos/Proyectos/Seguimiento-metas/DOCUMENTACION_API_METAS.html"
PDF_FILE = "/home/jorge/Documentos/Proyectos/Seguimiento-metas/DOCUMENTACION_API_METAS.pdf"

with open(MD_FILE, "r", encoding="utf-8") as f:
    md_content = f.read()

# Remover el encabezado duplicado del inicio del markdown si existe
if md_content.startswith("# Documentación Oficial"):
    # Cortar hasta después del primer separador '---'
    parts = md_content.split("---", 1)
    if len(parts) > 1:
        md_content = parts[1].strip()

# Convert Markdown to HTML with extensions
pygments_css = HtmlFormatter(style="monokai").get_style_defs('.codehilite')

html_body = markdown.markdown(
    md_content,
    extensions=[
        'tables',
        'fenced_code',
        'codehilite',
        'toc',
        'nl2br',
        'sane_lists'
    ]
)

# Custom Styling for PDF
custom_css = f"""
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

@page {{
    size: A4;
    margin: 20mm 15mm 20mm 15mm;
    @top-right {{
        content: "Gobernación de Norte de Santander";
        font-family: 'Inter', sans-serif;
        font-size: 8pt;
        color: #64748b;
    }}
    @bottom-left {{
        content: "API Seguimiento PDD - Documento de Integración Técnica";
        font-family: 'Inter', sans-serif;
        font-size: 8pt;
        color: #64748b;
    }}
    @bottom-right {{
        content: counter(page);
        font-family: 'Inter', sans-serif;
        font-size: 8pt;
        font-weight: bold;
        color: #1e293b;
    }}
}}

* {{
    box-sizing: border-box;
}}

body {{
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: #1e293b;
    line-height: 1.6;
    font-size: 10pt;
    margin: 0;
    padding: 0;
    background: #ffffff;
}}

/* Portada / Header principal */
.header-container {{
    border-bottom: 3px solid #0284c7;
    padding-bottom: 18px;
    margin-bottom: 24px;
}}

.institution-tag {{
    display: inline-block;
    background: #e0f2fe;
    color: #0369a1;
    font-size: 8.5pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 4px 10px;
    border-radius: 4px;
    margin-bottom: 10px;
}}

h1 {{
    color: #0f172a;
    font-size: 20pt;
    font-weight: 800;
    line-height: 1.25;
    margin: 0 0 8px 0;
}}

.subtitle {{
    color: #475569;
    font-size: 11pt;
    font-weight: 500;
    margin: 0;
}}

.meta-info {{
    display: flex;
    gap: 20px;
    margin-top: 14px;
    padding: 10px 14px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 8.5pt;
    color: #475569;
}}

.meta-info strong {{
    color: #0f172a;
}}

/* Encabezados */
h2 {{
    color: #0369a1;
    font-size: 13.5pt;
    font-weight: 700;
    margin-top: 24px;
    margin-bottom: 12px;
    border-bottom: 1.5px solid #e2e8f0;
    padding-bottom: 5px;
    page-break-after: avoid;
}}

h3 {{
    color: #0f172a;
    font-size: 11.5pt;
    font-weight: 600;
    margin-top: 18px;
    margin-bottom: 8px;
    page-break-after: avoid;
}}

h4 {{
    color: #334155;
    font-size: 10.5pt;
    font-weight: 600;
    margin-top: 14px;
    margin-bottom: 6px;
    page-break-after: avoid;
}}

p, ul, ol {{
    margin-top: 0;
    margin-bottom: 10px;
}}

ul, ol {{
    padding-left: 20px;
}}

li {{
    margin-bottom: 4px;
}}

/* Tablas */
table {{
    width: 100%;
    border-collapse: collapse;
    margin: 14px 0;
    font-size: 8.5pt;
    page-break-inside: auto;
}}

tr {{
    page-break-inside: avoid;
    page-break-after: auto;
}}

thead tr {{
    background-color: #0f172a;
    color: #ffffff;
}}

th {{
    padding: 8px 10px;
    text-align: left;
    font-weight: 600;
    border: 1px solid #1e293b;
}}

td {{
    padding: 7px 10px;
    border: 1px solid #e2e8f0;
    vertical-align: top;
}}

tbody tr:nth-child(even) {{
    background-color: #f8fafc;
}}

/* Bloques de código */
.codehilite {{
    background: #0f172a !important;
    border-radius: 6px;
    padding: 10px 14px;
    margin: 10px 0 14px 0;
    overflow-x: auto;
    page-break-inside: avoid;
    border: 1px solid #1e293b;
}}

.codehilite pre {{
    margin: 0;
    font-family: 'JetBrains Mono', 'Fira Code', Menlo, Consolas, monospace;
    font-size: 8pt;
    line-height: 1.45;
    color: #f8fafc;
    white-space: pre-wrap;
    word-break: break-all;
}}

code {{
    font-family: 'JetBrains Mono', 'Fira Code', Menlo, Consolas, monospace;
    font-size: 8.5pt;
    background: #f1f5f9;
    color: #0f172a;
    padding: 2px 5px;
    border-radius: 4px;
    border: 1px solid #e2e8f0;
}}

.codehilite code {{
    background: transparent;
    padding: 0;
    border: none;
    color: inherit;
}}

/* Callouts / Blockquotes */
blockquote {{
    margin: 14px 0;
    padding: 10px 14px;
    background-color: #f0fdf4;
    border-left: 4px solid #16a34a;
    border-radius: 0 6px 6px 0;
    color: #166534;
    font-size: 9pt;
    page-break-inside: avoid;
}}

blockquote p:last-child {{
    margin-bottom: 0;
}}

/* Resaltado especial */
strong {{
    font-weight: 600;
    color: #0f172a;
}}

/* Insignias de Métodos HTTP */
.http-get {{
    background: #dbeafe;
    color: #1e40af;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: bold;
    font-size: 8pt;
}}

.http-post {{
    background: #dcfce7;
    color: #166534;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: bold;
    font-size: 8pt;
}}

/* Separador horizontal */
hr {{
    border: none;
    border-top: 1px solid #e2e8f0;
    margin: 20px 0;
}}

/* Ajustes de impresión */
@media print {{
    body {{
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }}
    .no-print {{
        display: none;
    }}
}}

{pygments_css}
"""

full_html = f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Documentación Oficial de Integración - API de Seguimiento de Metas PDD</title>
    <style>
    {custom_css}
    </style>
</head>
<body>
    <div class="header-container">
        <span class="institution-tag">Gobernación de Norte de Santander</span>
        <h1>Documentación Oficial de Integración</h1>
        <p class="subtitle">API de Seguimiento de Metas - Plan de Desarrollo Departamental "Norte Territorio de Paz" (2024-2027)</p>
        <div class="meta-info">
            <div><strong>Entorno:</strong> Producción</div>
            <div><strong>Dominio API:</strong> https://apiseguimientopdd.nortedesantander.gov.co</div>
            <div><strong>Tipo:</strong> REST / JSON / JWT Bearer</div>
            <div><strong>Fecha:</strong> Octubre 2026</div>
        </div>
    </div>

    {html_body}
</body>
</html>
"""

# Limpiar el primer encabezado repetido en html_body si existe
# El markdown original empieza con "# Documentación Oficial de Integración..."
with open(HTML_FILE, "w", encoding="utf-8") as f:
    f.write(full_html)

print("HTML generado exitosamente:", HTML_FILE)
