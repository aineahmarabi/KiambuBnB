import re

def check_balance(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # extract JSX only
    start_idx = content.find('return (')
    if start_idx == -1:
        return "Could not find 'return ('"
    jsx = content[start_idx:]

    # regex to find <div and </div
    div_opens = [m.start() for m in re.finditer(r'<div\b[^>]*>', jsx)]
    div_closes = [m.start() for m in re.finditer(r'</div>', jsx)]

    print(f"Total <div...>: {len(div_opens)}")
    print(f"Total </div>: {len(div_closes)}")
    print(f"Difference: {len(div_opens) - len(div_closes)}")
    
    # Let's also check <section>
    sec_opens = len(re.findall(r'<section\b[^>]*>', jsx))
    sec_closes = len(re.findall(r'</section>', jsx))
    print(f"<section>: {sec_opens} open, {sec_closes} close")

check_balance('src/app/(storefront)/page.tsx')
