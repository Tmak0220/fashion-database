import ReactMarkdown from 'react-markdown';

type ContentType = 'text' | 'markdown' | 'html';

type Props = {
  content: string;
  type?: ContentType;
};

export default function ContentRenderer({ content, type = 'text' }: Props) {
  const baseClasses = "prose prose-neutral max-w-none text-sm leading-relaxed text-muted";

  switch (type) {
    case 'markdown':
      return (
        <div className={baseClasses}>
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      );

    case 'html':
      return (
        <div 
          className={`${baseClasses} prose-table:border-collapse prose-table:border prose-th:border prose-td:border prose-th:p-2 prose-td:p-2`}
          dangerouslySetInnerHTML={{ __html: content }} 
        />
      );

    case 'text':
    default:
      return (
        <p className="text-sm leading-relaxed text-muted whitespace-pre-line">
          {content}
        </p>
      );
  }
}