'use client'

import type * as React from 'react'

import { Button } from '@/components/ui/button'
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
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select'

export function EmployeeDetailDrawer({
  trigger,
  title = '编辑员工信息',
  description = '维护员工的基础、证件、入职与岗位信息',
}: {
  trigger: React.ReactNode
  title?: string
  description?: string
}) {
  return (
    <Drawer direction="right">
      <DrawerTrigger render={trigger as React.ReactElement} />
      <DrawerContent className="data-[vaul-drawer-direction=right]:sm:max-w-md">
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4">
          <FieldGroup>
            <FieldSet>
              <FieldLegend>基础信息</FieldLegend>
              <Field>
                <FieldLabel htmlFor="emp-name">姓名</FieldLabel>
                <Input id="emp-name" placeholder="请输入员工姓名" defaultValue="王思远" />
              </Field>
              <Field>
                <FieldLabel htmlFor="emp-phone">手机号</FieldLabel>
                <Input id="emp-phone" placeholder="请输入手机号" defaultValue="138 0013 8000" />
              </Field>
            </FieldSet>

            <FieldSet>
              <FieldLegend>证件信息</FieldLegend>
              <Field>
                <FieldLabel htmlFor="emp-idtype">证件类型</FieldLabel>
                <NativeSelect id="emp-idtype" defaultValue="id">
                  <NativeSelectOption value="id">居民身份证</NativeSelectOption>
                  <NativeSelectOption value="passport">护照</NativeSelectOption>
                  <NativeSelectOption value="hk">港澳居民来往内地通行证</NativeSelectOption>
                </NativeSelect>
              </Field>
              <Field>
                <FieldLabel htmlFor="emp-idno">证件号码</FieldLabel>
                <Input id="emp-idno" placeholder="请输入证件号码" defaultValue="110108199203150018" />
              </Field>
            </FieldSet>

            <FieldSet>
              <FieldLegend>入职信息</FieldLegend>
              <Field>
                <FieldLabel htmlFor="emp-join">入职日期</FieldLabel>
                <Input id="emp-join" type="date" defaultValue="2023-04-10" />
              </Field>
              <Field>
                <FieldLabel htmlFor="emp-status">在职状态</FieldLabel>
                <NativeSelect id="emp-status" defaultValue="active">
                  <NativeSelectOption value="active">在职</NativeSelectOption>
                  <NativeSelectOption value="probation">试用期</NativeSelectOption>
                  <NativeSelectOption value="leave">离职</NativeSelectOption>
                </NativeSelect>
              </Field>
            </FieldSet>

            <FieldSet>
              <FieldLegend>部门岗位</FieldLegend>
              <Field>
                <FieldLabel htmlFor="emp-dept">部门</FieldLabel>
                <NativeSelect id="emp-dept" defaultValue="fin">
                  <NativeSelectOption value="fin">财务部</NativeSelectOption>
                  <NativeSelectOption value="tech">技术部</NativeSelectOption>
                  <NativeSelectOption value="ops">运营部</NativeSelectOption>
                </NativeSelect>
              </Field>
              <Field>
                <FieldLabel htmlFor="emp-title">岗位</FieldLabel>
                <Input id="emp-title" placeholder="请输入岗位" defaultValue="高级会计" />
              </Field>
            </FieldSet>
          </FieldGroup>
        </div>

        <DrawerFooter className="flex-row justify-end gap-2">
          <DrawerClose
            render={
              <Button variant="outline">取消</Button>
            }
          />
          <Button>保存</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
