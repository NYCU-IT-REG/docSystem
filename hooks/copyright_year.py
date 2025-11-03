"""
MkDocs hook to automatically update copyright year and fix 404 page language
"""
import time
import shutil
import os
from pathlib import Path

def on_config(config, **kwargs):
    """
    Update copyright with current year
    """
    current_year = time.strftime("%Y")

    # Get the original copyright text
    copyright_text = config.get('copyright', '')

    # Replace any year pattern or add current year
    if copyright_text:
        # Update the copyright with current year
        config['copyright'] = f"Copyright &copy; {current_year} 國立陽明交通大學資訊技術服務中心"

    return config

def on_post_build(config, **kwargs):
    """
    After build, copy the Chinese 404 page to root and fix relative paths
    """
    site_dir = config['site_dir']

    # Path to Chinese 404 page (correct language)
    zh_404_path = Path(site_dir) / '404' / 'index.html'

    # Path to root 404 page (currently incorrect language)
    root_404_path = Path(site_dir) / '404.html'

    # Copy Chinese version to root if it exists
    if zh_404_path.exists():
        # Read the content
        with open(zh_404_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Fix relative paths in navigation for root-level 404.html
        # Change href=".." to href="/"
        content = content.replace('href=".."', 'href="/"')
        # Change href="../ to href="/
        content = content.replace('href="../', 'href="/')
        # Change src="../ to src="/
        content = content.replace('src="../', 'src="/')

        # Add language detection and redirect script after </head> tag
        redirect_script = '''  <script>
    // Redirect to appropriate language 404 page based on URL path
    (function() {
      var path = window.location.pathname;

      // If the original request was under /en/, redirect to English 404 page
      if (path.startsWith('/en/') && !path.includes('/en/404')) {
        window.location.replace('/en/404/');
      }
    })();
  </script>
</head>'''

        # Insert the redirect script before </head>
        content = content.replace('</head>', redirect_script)

        # Write the modified content to root 404.html
        with open(root_404_path, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"  ℹ️  Copied Chinese 404 page to root (404.html) with language redirect")

    return config
