"""
MkDocs hook to automatically update copyright year
"""
import time

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
