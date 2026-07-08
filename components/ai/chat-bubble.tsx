import type * as React from 'react'
import { BotIcon, UserIcon } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

export type ChatRole = 'user' | 'agent' | 'system'

export interface ChatBubbleProps extends React.ComponentProps<'div'> {
  role: ChatRole
  /** 发送者名称，agent / user 显示 */
  author?: string
  /** 时间戳文案 */
  timestamp?: string
  avatarSrc?: string
  icon?: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  /** 气泡下方的附加内容，如操作按钮、引用、工具调用 */
  footer?: React.ReactNode
}

export function ChatBubble({
  role,
  author,
  timestamp,
  avatarSrc,
  icon,
  children,
  footer,
  className,
  ...props
}: ChatBubbleProps) {
  if (role === 'system') {
    return (
      <div
        className={cn('flex justify-center px-2 py-1', className)}
        {...props}
      >
        <span className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
          {children}
        </span>
      </div>
    )
  }

  const isUser = role === 'user'
  const Icon = icon ?? (isUser ? UserIcon : BotIcon)
  const initials = author?.slice(0, 2) ?? (isUser ? '我' : 'AI')

  return (
    <div
      className={cn(
        'flex items-start gap-3',
        isUser && 'flex-row-reverse',
        className,
      )}
      {...props}
    >
      <Avatar className="size-8 shrink-0">
        <AvatarImage src={avatarSrc} alt={author ?? ''} />
        <AvatarFallback
          className={cn(
            isUser
              ? 'bg-secondary text-secondary-foreground'
              : 'bg-primary text-primary-foreground',
          )}
        >
          {avatarSrc ? initials : <Icon className="size-4" />}
        </AvatarFallback>
      </Avatar>

      <div
        className={cn(
          'flex min-w-0 max-w-[80%] flex-col gap-1',
          isUser && 'items-end',
        )}
      >
        {author || timestamp ? (
          <div
            className={cn(
              'flex items-center gap-2 text-xs',
              isUser && 'flex-row-reverse',
            )}
          >
            {author ? (
              <span className="font-medium text-foreground">{author}</span>
            ) : null}
            {timestamp ? (
              <span className="text-text-tertiary">{timestamp}</span>
            ) : null}
          </div>
        ) : null}

        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
            isUser
              ? 'rounded-tr-sm bg-primary text-primary-foreground'
              : 'rounded-tl-sm border border-border bg-card text-foreground',
          )}
        >
          {children}
        </div>

        {footer ? <div className="flex items-center gap-1.5">{footer}</div> : null}
      </div>
    </div>
  )
}
