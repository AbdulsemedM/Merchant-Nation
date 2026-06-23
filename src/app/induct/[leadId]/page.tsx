import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { InductionWizard } from "@/components/wizards/induction-wizard";
import { getServerAuthSession } from "@/lib/auth";
import { getInductionDraft } from "@/app/actions/induction-draft";
import { InductionProductsCard } from "@/components/induct/induction-products-card";

export const dynamic = "force-dynamic";

export default async function InductPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const session = await getServerAuthSession();
  if (session?.role === "ADMIN") redirect("/");

  const { leadId } = await params;
  let lead: Awaited<
    ReturnType<
      typeof prisma.lead.findUnique<{
        where: { id: string };
        include: { zone: true; merchant: true; scoutedBy: { select: { name: true } } };
      }>
    >
  > | null = null;
  try {
    lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        zone: true,
        merchant: true,
        scoutedBy: { select: { name: true } },
      },
    });
  } catch {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
        <p className="text-muted-foreground text-center text-sm">
          Database unavailable. Start PostgreSQL (e.g. <code className="rounded bg-muted px-1 py-0.5 text-xs">docker compose up -d</code>) then run <code className="rounded bg-muted px-1 py-0.5 text-xs">npx prisma migrate deploy</code>.
        </p>
      </div>
    );
  }
  if (!lead) notFound();
  if (lead.status === "CONVERTED") redirect("/");

  const externalBanks =
    lead.externalBankIds.length > 0
      ? await prisma.externalBank.findMany({
          where: { id: { in: lead.externalBankIds } },
          select: { name: true },
        })
      : [];

  const draft = await getInductionDraft(leadId);
  let initialStep = 0;
  let initialKycValues: Partial<{
    ownerName: string;
    tradeLicenseNumber: string;
    tinNumber: string;
    phoneNumber: string;
    merchantAccountNumber: string;
  }> | undefined;

  if (lead.merchant) {
    initialStep = 2;
    initialKycValues = {
      ownerName: lead.merchant.ownerName,
      tradeLicenseNumber: lead.merchant.tradeLicenseNumber ?? "",
      tinNumber: lead.merchant.tinNumber ?? "",
      phoneNumber: lead.merchant.phoneNumber,
      merchantAccountNumber: lead.merchant.merchantAccountNumber ?? "",
    };
  } else if (draft) {
    initialStep = draft.currentStep;
    if (draft.kycFormData) initialKycValues = draft.kycFormData;
  }

  return (
    <div className="flex flex-1 flex-col p-4">
      <h1 className="mb-4 text-xl font-semibold text-foreground">Induct merchant</h1>

      <InductionProductsCard
        leadId={lead.id}
        initialInterests={lead.futureProductInterests}
        initialRegistered={lead.registeredProductInterests}
      />

      <InductionWizard
        lead={{
          id: lead.id,
          businessName: lead.businessName,
          category: lead.category,
          locationLat: lead.locationLat,
          locationLng: lead.locationLng,
          zone: lead.zone ? { code: lead.zone.code } : null,
          estimatedVolume: lead.estimatedVolume,
          photoUrl: lead.photoUrl,
          externalBankNames: externalBanks.map((b) => b.name),
          scoutedByName: lead.scoutedBy.name,
          scoutedAt: new Date(lead.createdAt).toLocaleString(),
          taskReportType: lead.taskReportType,
          inductionNote: lead.inductionNote,
        }}
        initialStep={initialStep}
        initialKycValues={initialKycValues}
      />
    </div>
  );
}
