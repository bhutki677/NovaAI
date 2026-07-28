'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FaRobot, FaUser, FaCopy, FaCheck } from 'react-icons/fa';
import { useState } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  files?: string;
}

export default function ChatMessage({
  message,
  onCopy,
}: {
  message: Message;
  onCopy: (content: string) => void;
}) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-3 animate-slide-in ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          isUser
            ? 'bg-dark-700'
            : 'bg-gradient-to-br from-primary-500 to-purple-600'
        }`}
      >
        {isUser ? (
          <FaUser className="text-dark-300 text-sm" />
        ) : (
          <FaRobot className="text-white text-sm" />
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 min-w-0 ${isUser ? 'flex flex-col items-end' : ''}`}>
        <div
          className={`inline-block max-w-[100%] rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-primary-600 text-white rounded-tr-md'
              : 'bg-dark-900 border border-dark-700 rounded-tl-md'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
          ) : (
            <div className="markdown-body text-sm">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    const codeString = String(children).replace(/\n$/, '');

                    if (match) {
                      return (
                        <div className="relative group my-3">
                          <div className="flex items-center justify-between bg-dark-800 px-4 py-1.5 rounded-t-lg text-xs text-dark-400">
                            <span>{match[1]}</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(codeString);
                              }}
                              className="hover:text-white transition-colors"
                            >
                              Copy
                            </button>
                          </div>
                          <SyntaxHighlighter
                            style={oneDark}
                            language={match[1]}
                            PreTag="div"
                            customStyle={{
                              margin: 0,
                              borderRadius: '0 0 8px 8px',
                              fontSize: '13px',
                            }}
                          >
                            {codeString}
                          </SyntaxHighlighter>
                        </div>
                      );
                    }

                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Actions for AI messages */}
        {!isUser && (
          <div className="flex items-center gap-2 mt-1 ml-1">
            <button
              onClick={handleCopy}
              className="p-1 hover:bg-dark-800 rounded text-dark-500 hover:text-white transition-colors"
              title="Copy message"
            >
              {copied ? <FaCheck className="text-green-400 text-xs" /> : <FaCopy className="text-xs" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
