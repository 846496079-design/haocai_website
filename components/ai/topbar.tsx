'use client'

import type * as React from 'react'
import {
  BellIcon,
  LogOutIcon,
  SearchIcon,
  SettingsIcon,
  UserIcon,
} from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { cn } from '@/lib/utils'

export interface TopbarCrumb {
  label: string
  href?: string
}

export interface TopbarProps extends React.ComponentProps<'header'> {
  crumbs: TopbarCrumb[]
  /** 用户名 */
  userName?: string
  userRole?: string
  avatarSrc?: string
  /** 未读通知数 */
  notifications?: number
  /** 顶栏右侧自定义区域，如模型切换器 */
  actions?: React.ReactNode
}

export function Topbar({
  crumbs,
  userName = '管理员',
  userRole = '工作空间管理员',
  avatarSrc,
  notifications = 0,
  actions,
  className,
  ...props
}: TopbarProps) {
  return (
    <header
      className={cn(
        'flex h-14 items-center justify-between gap-4 border-b border-border bg-card px-4',
        className,
      )}
      {...props}
    >
      <Breadcrumb className="min-w-0">
        <BreadcrumbList>
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1
            return (
              <BreadcrumbItem key={crumb.label}>
                {isLast ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <>
                    <BreadcrumbLink href={crumb.href}>
                      {crumb.label}
                    </BreadcrumbLink>
                    <BreadcrumbSeparator />
                  </>
                )}
              </BreadcrumbItem>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center gap-2">
        <InputGroup className="hidden w-56 md:flex">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput placeholder="搜索代理、任务、文件…" />
        </InputGroup>

        {actions}

        <Button
          variant="ghost"
          size="icon-sm"
          className="relative"
          aria-label={`通知${notifications > 0 ? `，${notifications} 条未读` : ''}`}
        >
          <BellIcon />
          {notifications > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-status-error px-1 text-[10px] font-medium leading-4 text-primary-foreground tabular-nums">
              {notifications > 99 ? '99+' : notifications}
            </span>
          ) : null}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="账户菜单"
              />
            }
          >
            <Avatar className="size-8">
              <AvatarImage src={avatarSrc} alt={userName} />
              <AvatarFallback>{userName.slice(0, 2)}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">
                  {userName}
                </span>
                <span className="text-xs font-normal text-muted-foreground">
                  {userRole}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserIcon data-icon="inline-start" />
              个人资料
            </DropdownMenuItem>
            <DropdownMenuItem>
              <SettingsIcon data-icon="inline-start" />
              工作空间设置
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <LogOutIcon data-icon="inline-start" />
              退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
