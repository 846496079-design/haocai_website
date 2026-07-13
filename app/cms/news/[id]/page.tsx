import { notFound, redirect } from "next/navigation";
import CmsNewsEditor from "@/components/cms/cms-news-editor";
import { getCmsAdmin } from "@/lib/cms/auth";
import {
  getCmsArticle,
  listCmsAuditLogs,
  listCmsCategories,
} from "@/lib/cms/store";

export const metadata = {
  robots: { index: false, follow: false },
  title: "编辑新闻草稿",
};

export default async function CmsNewsEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await getCmsAdmin())) redirect("/cms/login/");
  const article = await getCmsArticle(Number((await params).id));
  if (!article) notFound();
  const [categories, auditItems] = await Promise.all([
    listCmsCategories(),
    listCmsAuditLogs("news_article", String(article.id), 30),
  ]);
  return (
    <CmsNewsEditor
      initial={article}
      initialCategories={categories
        .filter((item) => item.status === "ACTIVE")
        .map((item) => item.name)}
      initialAuditItems={auditItems}
    />
  );
}
