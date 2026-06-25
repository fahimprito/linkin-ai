export const FINISHING_SUB_STAGES = ["Wash", "Sew", "Iron", "Pack"]

export function getFinishingSubStageGuidance(currentStage: string) {
  const guidance: Record<string, { summary: string; nextAction: string }> = {
    Wash: {
      summary: "Finishing begins by washing the incoming lots and preparing them for downstream handling.",
      nextAction: "Complete wash output and pass the lot into sewing preparation.",
    },
    Sew: {
      summary: "Sewing is active for labels, attachments, or finishing corrections before ironing.",
      nextAction: "Close sewing work and move the batch to ironing.",
    },
    Iron: {
      summary: "Ironing is in progress to bring the lot to final appearance and measurement readiness.",
      nextAction: "Finish ironing and release the batch to packing.",
    },
    Pack: {
      summary: "Packing is the last finishing sub-stage before shipment readiness reporting.",
      nextAction: "Close packing quantity and update the final daily report.",
    },
  }

  return (
    guidance[currentStage] ?? {
      summary: "Finishing sub-stage tracking is active.",
      nextAction: "Continue with the next finishing sub-stage.",
    }
  )
}
