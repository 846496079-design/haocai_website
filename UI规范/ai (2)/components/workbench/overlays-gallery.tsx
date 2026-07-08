'use client'

import {
  BellIcon,
  BotIcon,
  CopyIcon,
  EllipsisIcon,
  FileTextIcon,
  LayoutGridIcon,
  PencilIcon,
  PlayIcon,
  PlugIcon,
  ShieldCheckIcon,
  SparklesIcon,
  Trash2Icon,
  UserPlusIcon,
} from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from '@/components/ui/menubar'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Section, SectionHeader, ShowcaseBlock } from './showcase'

export function OverlaysGallery() {
  return (
    <>
      {/* Dialog */}
      <Section id="dialog">
        <SectionHeader
          index="18"
          title="Dialog 对话框"
          description="用于代理配置、确认等需要聚焦的模态交互，承载表单与关键决策。"
        />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <ShowcaseBlock title="新建代理" caption="模态表单录入">
            <Dialog>
              <DialogTrigger
                render={
                  <Button>
                    <BotIcon data-icon="inline-start" />
                    新建代理
                  </Button>
                }
              />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>配置新代理</DialogTitle>
                  <DialogDescription>
                    为多代理工作空间添加一个新的智能体，稍后可在编排画布中连接。
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-3 text-sm text-muted-foreground">
                  <p>代理将继承当前工作区的安全策略与审计配置。</p>
                </div>
                <DialogFooter>
                  <DialogClose
                    render={<Button variant="outline">取消</Button>}
                  />
                  <DialogClose render={<Button>创建代理</Button>} />
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </ShowcaseBlock>
          <ShowcaseBlock title="危险操作确认" caption="销毁前二次确认">
            <Dialog>
              <DialogTrigger
                render={
                  <Button variant="outline">
                    <Trash2Icon data-icon="inline-start" />
                    删除代理
                  </Button>
                }
              />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>确认删除该代理？</DialogTitle>
                  <DialogDescription>
                    此操作不可撤销。代理的运行历史与连接关系将被永久移除。
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose
                    render={<Button variant="outline">保留</Button>}
                  />
                  <DialogClose
                    render={<Button variant="destructive">永久删除</Button>}
                  />
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </ShowcaseBlock>
        </div>
      </Section>

      {/* Sheet */}
      <Section id="sheet">
        <SectionHeader
          index="19"
          title="Sheet 侧边面板"
          description="从屏幕边缘滑出的面板，适合代理详情、运行日志等辅助信息的就地查看。"
        />
        <ShowcaseBlock title="代理详情面板" caption="右侧滑出，不打断主流程">
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="outline">
                  <PlugIcon data-icon="inline-start" />
                  查看代理详情
                </Button>
              }
            />
            <SheetContent>
              <SheetHeader>
                <SheetTitle>运维巡检代理</SheetTitle>
                <SheetDescription>
                  实时监控基础设施健康度并自动生成处置建议。
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-4 px-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">状态</span>
                  <Badge variant="secondary">运行中</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">基础模型</span>
                  <span className="font-medium">GPT-4o</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">今日调用</span>
                  <span className="font-medium tabular-nums">1,284 次</span>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </ShowcaseBlock>
      </Section>

      {/* Drawer */}
      <Section id="drawer">
        <SectionHeader
          index="20"
          title="Drawer 抽屉"
          description="自底部滑出的抽屉，适合移动端或需要更大操作空间的临时任务面板。"
        />
        <ShowcaseBlock title="快速运行任务" caption="底部抽屉承载即时操作">
          <Drawer>
            <DrawerTrigger
              render={
                <Button variant="outline">
                  <PlayIcon data-icon="inline-start" />
                  运行批量任务
                </Button>
              }
            />
            <DrawerContent>
              <div className="mx-auto w-full max-w-md">
                <DrawerHeader>
                  <DrawerTitle>批量运行代理任务</DrawerTitle>
                  <DrawerDescription>
                    选择的 3 个代理将并行执行本次知识库同步任务。
                  </DrawerDescription>
                </DrawerHeader>
                <DrawerFooter>
                  <Button>开始执行</Button>
                  <DrawerClose render={<Button variant="outline">取消</Button>} />
                </DrawerFooter>
              </div>
            </DrawerContent>
          </Drawer>
        </ShowcaseBlock>
      </Section>

      {/* Dropdown Menu */}
      <Section id="dropdown-menu">
        <SectionHeader
          index="21"
          title="Dropdown Menu 下拉菜单"
          description="为代理卡片、列表行提供上下文操作集合，支持分组、快捷键与危险操作样式。"
        />
        <ShowcaseBlock title="代理操作菜单" caption="点击触发更多操作">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline">
                  <EllipsisIcon data-icon="inline-start" />
                  更多操作
                </Button>
              }
            />
            <DropdownMenuContent className="w-52">
              <DropdownMenuLabel>代理管理</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <PencilIcon />
                  编辑配置
                  <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CopyIcon />
                  克隆代理
                  <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileTextIcon />
                  导出运行日志
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                <Trash2Icon />
                删除代理
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ShowcaseBlock>
      </Section>

      {/* Context Menu */}
      <Section id="context-menu">
        <SectionHeader
          index="22"
          title="Context Menu 右键菜单"
          description="在编排画布的节点上右键唤起，提供贴近场景的就地操作。"
        />
        <ShowcaseBlock title="画布节点右键菜单" caption="在下方区域点击右键">
          <ContextMenu>
            <ContextMenuTrigger
              render={
                <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 text-sm text-muted-foreground">
                  在此区域右键单击
                </div>
              }
            />
            <ContextMenuContent className="w-52">
              <ContextMenuLabel>节点操作</ContextMenuLabel>
              <ContextMenuItem>
                <PlayIcon />
                运行此节点
                <ContextMenuShortcut>⌘R</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem>
                <CopyIcon />
                复制节点
                <ContextMenuShortcut>⌘C</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem variant="destructive">
                <Trash2Icon />
                移除节点
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </ShowcaseBlock>
      </Section>

      {/* Menubar */}
      <Section id="menubar">
        <SectionHeader
          index="23"
          title="Menubar 菜单栏"
          description="工作台顶部的全局菜单栏，组织文件、编排与视图等高频命令。"
        />
        <ShowcaseBlock title="工作台菜单栏" caption="桌面级应用的命令组织">
          <Menubar>
            <MenubarMenu>
              <MenubarTrigger>工作区</MenubarTrigger>
              <MenubarContent>
                <MenubarItem>
                  新建工作区 <MenubarShortcut>⌘N</MenubarShortcut>
                </MenubarItem>
                <MenubarItem>
                  导入配置 <MenubarShortcut>⌘I</MenubarShortcut>
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem>导出全部代理</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger>编排</MenubarTrigger>
              <MenubarContent>
                <MenubarItem>添加代理节点</MenubarItem>
                <MenubarItem>连接数据源</MenubarItem>
                <MenubarSeparator />
                <MenubarItem>运行全部</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger>视图</MenubarTrigger>
              <MenubarContent>
                <MenubarItem>显示运行日志</MenubarItem>
                <MenubarItem>显示性能面板</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </ShowcaseBlock>
      </Section>

      {/* Navigation Menu */}
      <Section id="navigation-menu">
        <SectionHeader
          index="24"
          title="Navigation Menu 导航菜单"
          description="承载工作台主导航的多级菜单，悬停展开丰富的内容面板。"
        />
        <ShowcaseBlock title="产品导航" caption="悬停展开内容面板">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>平台能力</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[420px] gap-1 p-1 md:grid-cols-2">
                    <li>
                      <NavigationMenuLink>
                        <SparklesIcon />
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium">代理编排</span>
                          <span className="text-xs text-muted-foreground">
                            可视化编排多代理协作流程
                          </span>
                        </div>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink>
                        <ShieldCheckIcon />
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium">安全治理</span>
                          <span className="text-xs text-muted-foreground">
                            细粒度权限与审计追踪
                          </span>
                        </div>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink>
                        <LayoutGridIcon />
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium">应用市场</span>
                          <span className="text-xs text-muted-foreground">
                            预置代理模板与连接器
                          </span>
                        </div>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink>
                        <BellIcon />
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium">智能告警</span>
                          <span className="text-xs text-muted-foreground">
                            运行异常实时通知
                          </span>
                        </div>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>解决方案</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[260px] gap-1 p-1">
                    <li>
                      <NavigationMenuLink>运维自动化</NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink>销售智能助手</NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink>知识库问答</NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </ShowcaseBlock>
      </Section>

      {/* Popover & Hover Card & Tooltip */}
      <Section id="popover">
        <SectionHeader
          index="25"
          title="Popover · Hover Card · Tooltip"
          description="三类轻量浮层：点击触发的气泡、悬停预览卡片与简短提示，覆盖不同信息密度。"
        />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <ShowcaseBlock title="Popover 气泡卡片" caption="点击触发">
            <Popover>
              <PopoverTrigger
                render={
                  <Button variant="outline">
                    <BellIcon data-icon="inline-start" />
                    通知设置
                  </Button>
                }
              />
              <PopoverContent>
                <PopoverHeader>
                  <PopoverTitle>告警通知</PopoverTitle>
                  <PopoverDescription>
                    选择代理异常时的通知渠道。
                  </PopoverDescription>
                </PopoverHeader>
                <div className="flex flex-col gap-2 text-sm">
                  <p className="text-muted-foreground">
                    当前已启用邮件与站内信通知。
                  </p>
                </div>
              </PopoverContent>
            </Popover>
          </ShowcaseBlock>
          <ShowcaseBlock title="Hover Card 悬停卡片" caption="悬停查看代理简介">
            <HoverCard>
              <HoverCardTrigger
                render={
                  <Button variant="link" className="w-fit px-0">
                    @运维巡检代理
                  </Button>
                }
              />
              <HoverCardContent>
                <div className="flex gap-3">
                  <Avatar className="size-10">
                    <AvatarImage src="/agent-avatar.png" alt="代理头像" />
                    <AvatarFallback>OP</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">运维巡检代理</p>
                    <p className="text-xs text-muted-foreground">
                      自动监控基础设施健康度，已稳定运行 142 天。
                    </p>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </ShowcaseBlock>
          <ShowcaseBlock title="Tooltip 提示" caption="悬停显示简短说明">
            <TooltipProvider>
              <div className="flex items-center gap-3">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button variant="outline" size="icon">
                        <UserPlusIcon />
                        <span className="sr-only">邀请成员</span>
                      </Button>
                    }
                  />
                  <TooltipContent>邀请团队成员</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button variant="outline" size="icon">
                        <CopyIcon />
                        <span className="sr-only">复制链接</span>
                      </Button>
                    }
                  />
                  <TooltipContent>复制共享链接</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </ShowcaseBlock>
        </div>
      </Section>
    </>
  )
}
