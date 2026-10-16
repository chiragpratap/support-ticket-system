
import Ticket from "../models/Ticket.js";

export const getDashboardStats = async () => {
  const [result] = await Ticket.aggregate([
    {
      $facet: {
        totals: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              open: {
                $sum: { $cond: [{ $eq: ["$status", "open"] }, 1, 0] },
              },
              inProgress: {
                $sum: {
                  $cond: [{ $eq: ["$status", "in_progress"] }, 1, 0],
                },
              },
              resolved: {
                $sum: {
                  $cond: [{ $eq: ["$status", "resolved"] }, 1, 0],
                },
              },
              closed: {
                $sum: { $cond: [{ $eq: ["$status", "closed"] }, 1, 0] },
              },
              urgent: {
                $sum: {
                  $cond: [{ $eq: ["$priority", "urgent"] }, 1, 0],
                },
              },
            },
          },
          { $project: { _id: 0 } },
        ],
        byPriority: [
          { $group: { _id: "$priority", count: { $sum: 1 } } },
        ],
        byStatus: [
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ],
      },
    },
  ]);

  const totals = result?.totals?.[0] ?? {
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    urgent: 0,
  };

  const toCountMap = (items) =>
    Object.fromEntries(items.map(({ _id, count }) => [_id, count]));

  return {
    totals,
    byPriority: toCountMap(result?.byPriority ?? []),
    byStatus: toCountMap(result?.byStatus ?? []),
  };
};
