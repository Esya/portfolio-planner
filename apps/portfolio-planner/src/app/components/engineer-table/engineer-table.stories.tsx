import { Story, Meta } from '@storybook/react'
import { EngineerTable } from './engineer-table'

export default {
  component: EngineerTable,
  title: 'EngineerTable',
} as Meta

const Template: Story = (args) => <EngineerTable {...args} />

export const Primary = Template.bind({})
Primary.args = {}
