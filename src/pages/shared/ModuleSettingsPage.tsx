import { Bell, Database, ShieldCheck } from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"

type ModuleSettingsPageProps = {
  title: string
  description: string
  sections: Array<{
    title: string
    description: string
  }>
}

const sectionIcons = [Bell, Database, ShieldCheck] as const

export function ModuleSettingsPage(props: ModuleSettingsPageProps) {
  const { title, sections } = props
  return (
    <div className="space-y-6">
      <PageHeader title={title} />
      <section className="grid gap-4 xl:grid-cols-3">
        {sections.map((section, index) => {
          const Icon = sectionIcons[index % sectionIcons.length]

          return (
            <div
              key={section.title}
              className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                  <Icon className="size-5" />
                </div>
                <h2 className="text-lg font-semibold">{section.title}</h2>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                {section.description}
              </p>
            </div>
          )
        })}
      </section>
    </div>
  )
}

