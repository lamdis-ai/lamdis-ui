export function CodeBlock({ code, language = 'text', className = '' }: { code: string; language?: string; className?: string }) {
  return (
    <pre className={[
      'bg-[#0e1220] border border-[#1b2136] rounded-xl p-3 md:p-4 overflow-auto',
      'text-[13px] md:text-[14px] leading-[1.55] text-[#e8f3ff]',
      className,
    ].join(' ')}>
      <code data-language={language}>{code}</code>
    </pre>
  );
}
