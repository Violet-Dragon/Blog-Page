
// Enhanced markdown-to-HTML converter for blog posts
export const markdownToHtml = (markdown: string): string => {
  if (!markdown) return '';
  
  let html = markdown;

  // ====================
  // CUSTOM STYLING (COLORS, FONTS, SIZES)
  // ====================
  
  // Text Color: {color:red}text{/color}
  html = html.replace(/\{color:([^}]+)\}(.*?)\{\/color\}/g, 
    '<span style="color: $1">$2</span>');
  
  // Background Color: {bg:yellow}text{/bg}
  html = html.replace(/\{bg:([^}]+)\}(.*?)\{\/bg\}/g, 
    '<span style="background-color: $1; padding: 2px 4px; border-radius: 2px">$2</span>');
  
  // Font Size: {size:24}Large Text{/size}
  html = html.replace(/\{size:(\d+)\}(.*?)\{\/size\}/g, 
    '<span style="font-size: $1px">$2</span>');
  
  // Font Family: {font:serif}Serif Text{/font}
  html = html.replace(/\{font:([^}]+)\}(.*?)\{\/font\}/g, 
    '<span style="font-family: $1">$2</span>');
  
  // Underline: {u}text{/u}
  html = html.replace(/\{u\}(.*?)\{\/u\}/g, 
    '<u class="decoration-2">$1</u>');

  // ====================
  // RTL SUPPORT (Right-to-Left Languages)
  // ====================
  
  // RTL Block: {rtl}Arabic/Hebrew text{/rtl}
  html = html.replace(/\{rtl\}(.*?)\{\/rtl\}/gs, 
    '<div dir="rtl" class="text-right">$1</div>');
  
  // LTR Block (explicit): {ltr}English text{/ltr}
  html = html.replace(/\{ltr\}(.*?)\{\/ltr\}/gs, 
    '<div dir="ltr" class="text-left">$1</div>');

  // ====================
  // CODE BLOCKS
  // ====================
  
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, language, code) => {
    const lang = language || 'text';
    return `<pre class="bg-muted rounded-lg p-4 my-6 overflow-x-auto"><code class="language-${lang} text-sm">${escapeHtml(code.trim())}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, 
    '<code class="bg-muted px-2 py-1 rounded text-sm font-mono text-primary">$1</code>');

  // ====================
  // BLOCKQUOTES
  // ====================
  html = html.replace(/^> (.+)$/gim, 
    '<blockquote class="border-l-4 border-primary pl-4 py-2 my-4 italic text-muted-foreground">$1</blockquote>');

  // ====================
  // HEADERS
  // ====================
  html = html.replace(/^##### (.*$)/gim, '<h5 class="text-lg font-bold mt-4 mb-2">$1</h5>');
  html = html.replace(/^#### (.*$)/gim, '<h4 class="text-xl font-bold mt-5 mb-2">$1</h4>');
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-2xl font-bold mt-6 mb-3">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-3xl font-bold mt-8 mb-4">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-4xl font-bold mt-8 mb-4">$1</h1>');

  // ====================
  // TEXT FORMATTING
  // ====================
  
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em class="font-bold italic">$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em class="italic">$1</em>');
  html = html.replace(/~~(.+?)~~/g, '<del class="line-through text-muted-foreground">$1</del>');
  html = html.replace(/==(.+?)==/g, '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>');

  // ====================
  // ALIGNMENT
  // ====================
  html = html.replace(/^:center:\s*(.+)$/gim, '<div class="text-center">$1</div>');
  html = html.replace(/^:right:\s*(.+)$/gim, '<div class="text-right">$1</div>');
  html = html.replace(/^:left:\s*(.+)$/gim, '<div class="text-left">$1</div>');
  html = html.replace(/^:justify:\s*(.+)$/gim, '<div class="text-justify">$1</div>');

  // ====================
  // IMAGES
  // ====================
  const imageWithCaptionPattern = /!$$([^$$]*)\]$([^)\s]+)\s+"([^"]+)"$/g;
  html = html.replace(imageWithCaptionPattern, 
    '<figure class="my-6"><img src="$2" alt="$1" class="w-full rounded-lg shadow-lg" loading="lazy" /><figcaption class="text-center text-sm text-muted-foreground mt-2">$3</figcaption></figure>');
  
  const imagePattern = /!$$([^$$]*)\]$([^)]+)$/g;
  html = html.replace(imagePattern, 
    '<img src="$2" alt="$1" class="w-full rounded-lg my-6 shadow-lg" loading="lazy" onerror="this.src=\'/placeholder.svg\'" />');

  // ====================
  // LINKS
  // ====================
  const linkPattern = /$$([^$$]+)\]$([^)]+)$/g;
  html = html.replace(linkPattern, 
    '<a href="$2" class="text-primary hover:underline font-medium transition-colors" target="_blank" rel="noopener noreferrer">$1</a>');

  // ====================
  // LISTS
  // ====================
  
  const orderedListRegex = /^(\d+)\.\s+(.+)$/gim;
  let orderedListItems: string[] = [];
  html = html.replace(orderedListRegex, (match, number, content) => {
    orderedListItems.push(`<li class="ml-6 mb-2">${content}</li>`);
    return '||ORDERED_LIST_ITEM||';
  });
  
  if (orderedListItems.length > 0) {
    const orderedListHtml = `<ol class="list-decimal my-4 space-y-1">${orderedListItems.join('')}</ol>`;
    html = html.replace(/(\|\|ORDERED_LIST_ITEM\|\|\n?)+/g, orderedListHtml);
    orderedListItems = [];
  }

  const unorderedListRegex = /^[-*]\s+(.+)$/gim;
  const unorderedListItems: string[] = [];
  html = html.replace(unorderedListRegex, (match, content) => {
    const taskPattern = /^$$([x ])$$\s+(.+)$/;
    const taskMatch = content.match(taskPattern);
    
    if (taskMatch) {
      const checked = taskMatch[1] === 'x';
      const taskContent = taskMatch[2];
      unorderedListItems.push(
        `<li class="ml-6 mb-2 flex items-start gap-2">
          <input type="checkbox" ${checked ? 'checked' : ''} disabled class="mt-1" />
          <span class="${checked ? 'line-through text-muted-foreground' : ''}">${taskContent}</span>
        </li>`
      );
    } else {
      unorderedListItems.push(`<li class="ml-6 mb-2 list-disc">${content}</li>`);
    }
    return '||UNORDERED_LIST_ITEM||';
  });
  
  if (unorderedListItems.length > 0) {
    const unorderedListHtml = `<ul class="my-4 space-y-1">${unorderedListItems.join('')}</ul>`;
    html = html.replace(/(\|\|UNORDERED_LIST_ITEM\|\|\n?)+/g, unorderedListHtml);
  }

  // ====================
  // TABLES
  // ====================
  const tableRegex = /\|(.+)\|\n\|[\s\-:|]+\|\n((?:\|.+\|\n?)+)/gim;
  html = html.replace(tableRegex, (match, header, rows) => {
    const headers = header.split('|').map((h: string) => h.trim()).filter(Boolean);
    const rowsArray = rows.trim().split('\n').map((row: string) => 
      row.split('|').map((cell: string) => cell.trim()).filter(Boolean)
    );

    const headerHtml = `<thead class="bg-muted"><tr>${headers.map((h: string) => 
      `<th class="border border-border px-4 py-2 text-left font-semibold">${h}</th>`
    ).join('')}</tr></thead>`;

    const bodyHtml = `<tbody>${rowsArray.map((row: string[]) => 
      `<tr class="border-b border-border hover:bg-muted/50">${row.map((cell: string) => 
        `<td class="border border-border px-4 py-2">${cell}</td>`
      ).join('')}</tr>`
    ).join('')}</tbody>`;

    return `<div class="overflow-x-auto my-6"><table class="w-full border-collapse border border-border rounded-lg">${headerHtml}${bodyHtml}</table></div>`;
  });

  // ====================
  // PARAGRAPHS
  // ====================
  html = html.split('\n\n').map(para => {
    para = para.trim();
    if (!para || para.startsWith('<') || para.includes('||')) {
      return para;
    }
    return `<p class="mb-4 leading-relaxed text-foreground">${para}</p>`;
  }).join('\n');

  html = html.replace(/\|\|ORDERED_LIST_ITEM\|\|/g, '');
  html = html.replace(/\|\|UNORDERED_LIST_ITEM\|\|/g, '');

  return html;
};

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, char => map[char]);
}

// ====================
// BLOG-FRIENDLY FONTS
// ====================
export const blogFonts = [
  { name: 'Default (System)', value: 'system-ui, -apple-system, sans-serif' },
  { name: 'Serif (Georgia)', value: 'Georgia, serif' },
  { name: 'Sans-Serif (Arial)', value: 'Arial, sans-serif' },
  { name: 'Monospace (Courier)', value: '"Courier New", monospace' },
  { name: 'Playfair Display', value: '"Playfair Display", serif' },
  { name: 'Lora', value: 'Lora, serif' },
  { name: 'Merriweather', value: 'Merriweather, serif' },
  { name: 'Open Sans', value: '"Open Sans", sans-serif' },
  { name: 'Roboto', value: 'Roboto, sans-serif' },
  { name: 'PT Serif', value: '"PT Serif", serif' },
];

// ====================
// REGIONAL LANGUAGE SUPPORT
// ====================
export const supportedLanguages = [
  { code: 'en', name: 'English', direction: 'ltr' },
  { code: 'hi', name: 'Hindi (हिन्दी)', direction: 'ltr' },
  { code: 'ar', name: 'Arabic (العربية)', direction: 'rtl' },
  { code: 'zh', name: 'Chinese (中文)', direction: 'ltr' },
  { code: 'es', name: 'Spanish (Español)', direction: 'ltr' },
  { code: 'fr', name: 'French (Français)', direction: 'ltr' },
  { code: 'de', name: 'German (Deutsch)', direction: 'ltr' },
  { code: 'ja', name: 'Japanese (日本語)', direction: 'ltr' },
  { code: 'ko', name: 'Korean (한국어)', direction: 'ltr' },
  { code: 'pt', name: 'Portuguese (Português)', direction: 'ltr' },
  { code: 'ru', name: 'Russian (Русский)', direction: 'ltr' },
  { code: 'bn', name: 'Bengali (বাংলা)', direction: 'ltr' },
  { code: 'ur', name: 'Urdu (اردو)', direction: 'rtl' },
  { code: 'he', name: 'Hebrew (עברית)', direction: 'rtl' },
];

// // Enhanced markdown-to-HTML converter for blog posts
// export const markdownToHtml = (markdown: string): string => {
//   if (!markdown) return '';
  
//   let html = markdown;

//   // CODE BLOCKS - Multi-line with syntax highlighting
//   html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, language, code) => {
//     const lang = language || 'text';
//     return `<pre class="bg-muted rounded-lg p-4 my-6 overflow-x-auto"><code class="language-${lang} text-sm">${escapeHtml(code.trim())}</code></pre>`;
//   });

//   // Inline code
//   html = html.replace(/`([^`]+)`/g, '<code class="bg-muted px-2 py-1 rounded text-sm font-mono text-primary">$1</code>');

//   // BLOCKQUOTES
//   html = html.replace(/^> (.+)$/gim, '<blockquote class="border-l-4 border-primary pl-4 py-2 my-4 italic text-muted-foreground">$1</blockquote>');

//   // HEADERS H1-H6
//   html = html.replace(/^##### (.*$)/gim, '<h5 class="text-lg font-bold mt-4 mb-2">$1</h5>');
//   html = html.replace(/^#### (.*$)/gim, '<h4 class="text-xl font-bold mt-5 mb-2">$1</h4>');
//   html = html.replace(/^### (.*$)/gim, '<h3 class="text-2xl font-bold mt-6 mb-3">$1</h3>');
//   html = html.replace(/^## (.*$)/gim, '<h2 class="text-3xl font-bold mt-8 mb-4">$1</h2>');
//   html = html.replace(/^# (.*$)/gim, '<h1 class="text-4xl font-bold mt-8 mb-4">$1</h1>');

//   // HORIZONTAL RULES
//   html = html.replace(/^---$/gim, '<hr class="my-8 border-border" />');
//   html = html.replace(/^\*\*\*$/gim, '<hr class="my-8 border-border" />');

//   // TEXT FORMATTING - Bold & Italic combined
//   html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em class="font-bold italic">$1</em></strong>');
  
//   // Bold
//   html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>');
  
//   // Italic
//   html = html.replace(/\*(.+?)\*/g, '<em class="italic">$1</em>');
  
//   // Strikethrough
//   html = html.replace(/~~(.+?)~~/g, '<del class="line-through text-muted-foreground">$1</del>');
  
//   // Highlight
//   html = html.replace(/==(.+?)==/g, '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>');

//   // IMAGES with captions - Pattern: ![alt](url "caption")
//   const imageWithCaptionPattern = /!$$([^$$]*)\]$([^)\s]+)\s+"([^"]+)"$/g;
//   html = html.replace(imageWithCaptionPattern, 
//     '<figure class="my-6"><img src="$2" alt="$1" class="w-full rounded-lg shadow-lg" loading="lazy" /><figcaption class="text-center text-sm text-muted-foreground mt-2">$3</figcaption></figure>');
  
//   // Images without captions - Pattern: ![alt](url)
//   const imagePattern = /!$$([^$$]*)\]$([^)]+)$/g;
//   html = html.replace(imagePattern, 
//     '<img src="$2" alt="$1" class="w-full rounded-lg my-6 shadow-lg" loading="lazy" onerror="this.src=\'/placeholder.svg\'" />');

//   // LINKS - Pattern: [text](url)
//   const linkPattern = /$$([^$$]+)\]$([^)]+)$/g;
//   html = html.replace(linkPattern, '<a href="$2" class="text-primary hover:underline font-medium transition-colors" target="_blank" rel="noopener noreferrer">$1</a>');

//   // ORDERED LISTS
//   const orderedListRegex = /^(\d+)\.\s+(.+)$/gim;
//   let orderedListItems: string[] = [];
//   html = html.replace(orderedListRegex, (match, number, content) => {
//     orderedListItems.push(`<li class="ml-6 mb-2">${content}</li>`);
//     return '||ORDERED_LIST_ITEM||';
//   });
  
//   if (orderedListItems.length > 0) {
//     const orderedListHtml = `<ol class="list-decimal my-4 space-y-1">${orderedListItems.join('')}</ol>`;
//     html = html.replace(/(\|\|ORDERED_LIST_ITEM\|\|\n?)+/g, orderedListHtml);
//     orderedListItems = [];
//   }

//   // UNORDERED LISTS
//   const unorderedListRegex = /^[-*]\s+(.+)$/gim;
//   let unorderedListItems: string[] = [];
//   html = html.replace(unorderedListRegex, (match, content) => {
//     // Check for task list checkbox
//     const taskPattern = /^$$([x ])$$\s+(.+)$/;
//     const taskMatch = content.match(taskPattern);
    
//     if (taskMatch) {
//       const checked = taskMatch[1] === 'x';
//       const taskContent = taskMatch[2];
//       unorderedListItems.push(
//         `<li class="ml-6 mb-2 flex items-start gap-2">
//           <input type="checkbox" ${checked ? 'checked' : ''} disabled class="mt-1" />
//           <span class="${checked ? 'line-through text-muted-foreground' : ''}">${taskContent}</span>
//         </li>`
//       );
//     } else {
//       unorderedListItems.push(`<li class="ml-6 mb-2 list-disc">${content}</li>`);
//     }
//     return '||UNORDERED_LIST_ITEM||';
//   });
  
 
// // ====================
// // TEXT ALIGNMENT (Custom Syntax)
// // ====================
// // Usage: 
// // :center: This text is centered
// // :right: This text is right-aligned
// // :left: This text is left-aligned
// // :justify: This text is justified

// html = html.replace(/^:center:\s*(.+)$/gim, '<div class="text-center">$1</div>');
// html = html.replace(/^:right:\s*(.+)$/gim, '<div class="text-right">$1</div>');
// html = html.replace(/^:left:\s*(.+)$/gim, '<div class="text-left">$1</div>');
// html = html.replace(/^:justify:\s*(.+)$/gim, '<div class="text-justify">$1</div>');
//   if (unorderedListItems.length > 0) {
//     const unorderedListHtml = `<ul class="my-4 space-y-1">${unorderedListItems.join('')}</ul>`;
//     html = html.replace(/(\|\|UNORDERED_LIST_ITEM\|\|\n?)+/g, unorderedListHtml);
//     unorderedListItems = [];
//   }

//   // TABLES
//   const tableRegex = /\|(.+)\|\n\|[\s\-:|]+\|\n((?:\|.+\|\n?)+)/gim;
//   html = html.replace(tableRegex, (match, header, rows) => {
//     const headers = header.split('|').map((h: string) => h.trim()).filter(Boolean);
//     const rowsArray = rows.trim().split('\n').map((row: string) => 
//       row.split('|').map((cell: string) => cell.trim()).filter(Boolean)
//     );

//     const headerHtml = `<thead class="bg-muted"><tr>${headers.map((h: string) => 
//       `<th class="border border-border px-4 py-2 text-left font-semibold">${h}</th>`
//     ).join('')}</tr></thead>`;

//     const bodyHtml = `<tbody>${rowsArray.map((row: string[]) => 
//       `<tr class="border-b border-border hover:bg-muted/50">${row.map((cell: string) => 
//         `<td class="border border-border px-4 py-2">${cell}</td>`
//       ).join('')}</tr>`
//     ).join('')}</tbody>`;

//     return `<div class="overflow-x-auto my-6"><table class="w-full border-collapse border border-border rounded-lg">${headerHtml}${bodyHtml}</table></div>`;
//   });

//   // PARAGRAPHS
//   html = html.split('\n\n').map(para => {
//     para = para.trim();
//     if (!para || para.startsWith('<') || para.includes('||')) {
//       return para;
//     }
//     return `<p class="mb-4 leading-relaxed text-foreground">${para}</p>`;
//   }).join('\n');

//   // Clean up markers
//   html = html.replace(/\|\|ORDERED_LIST_ITEM\|\|/g, '');
//   html = html.replace(/\|\|UNORDERED_LIST_ITEM\|\|/g, '');

//   return html;
// };

// function escapeHtml(text: string): string {
//   const map: { [key: string]: string } = {
//     '&': '&amp;',
//     '<': '&lt;',
//     '>': '&gt;',
//     '"': '&quot;',
//     "'": '&#039;'
//   };
//   return text.replace(/[&<>"']/g, char => map[char]);
// }

// export const addSyntaxHighlighting = () => {
//   if (typeof window !== 'undefined') {
//     const codeBlocks = document.querySelectorAll('pre code');
//     codeBlocks.forEach((block) => {
//       // Add syntax highlighting library here
//     });
//   }
// };

// export const getMarkdownPreview = (markdown: string, maxLength: number = 150): string => {
//   let preview = markdown
//     .replace(/```[\s\S]*?```/g, '')
//     .replace(/`[^`]+`/g, '')
//     .replace(/!$$([^$$]*)\]$([^)]+)$/g, '')
//     .replace(/$$([^$$]+)\]$([^)]+)$/g, '$1')
//     .replace(/[#*_~=]/g, '')
//     .replace(/^>\s+/gm, '')
//     .trim();

//   if (preview.length > maxLength) {
//     preview = preview.substring(0, maxLength) + '...';
//   }

//   return preview;
// };