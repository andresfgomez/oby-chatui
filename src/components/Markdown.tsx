import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeHighlight from 'rehype-highlight'

type Props = { content: string }

const Markdown: React.FC<Props> = ({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex, rehypeHighlight]}     
      components={{
        a: (props) => <a {...props} rel="noopener noreferrer" />,
        img: (props) => <img {...props} style={{ maxWidth: '100%' }} />
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

export default Markdown