type Props = {
    title: string
    content?: string | null
    isVisible?: boolean | null
  }
  
  export default function IntroSection({
    title,
    content,
    isVisible,
  }: Props) {
    if (!isVisible || !content) {
      return null
    }
  
    return (
      <details className="mt-6 text-sm text-muted leading-relaxed">
        <summary className="cursor-pointer hover:text-black transition font-medium">
          {title}
        </summary>
  
        <p className="mt-4 whitespace-pre-line">
          {content}
        </p>
      </details>
    )
  }