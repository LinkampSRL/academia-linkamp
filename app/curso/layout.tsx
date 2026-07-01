import { getCourse } from '@/lib/course'
import { getModuleSections } from '@/lib/content'
import CourseShell from '@/components/CourseShell'

export default function CursoLayout({ children }: { children: React.ReactNode }) {
  const course = getCourse()

  const sectionsMap = Object.fromEntries(
    course.modulos.map((m) => [m.slug, getModuleSections(m.slug)])
  )

  return (
    <div className="flex flex-col h-full">
      <CourseShell course={course} sectionsMap={sectionsMap}>
        {children}
      </CourseShell>
    </div>
  )
}
