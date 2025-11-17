import { ProjectForm } from '@/components/projects/project-form';

export default function NewProjectPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">ახალი პროექტი</h1>
        <p className="text-muted-foreground mt-2">
          შექმენით ახალი პროექტი და დაიწყეთ მისი მართვა
        </p>
      </div>
      <div className="max-w-3xl">
        <ProjectForm />
      </div>
    </div>
  );
}
