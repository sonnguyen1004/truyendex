"use client";

import useSWR from "swr";
import { MangadexApi } from "@/api";
import { ExtendChapter } from "@/types/mangadex";
import { extendRelationship } from "@/utils/mangadex";
import { LAST_UPDATES_LIMIT } from "@/constants";

export const chaptersPerPage = LAST_UPDATES_LIMIT;

export default function useLastUpdates(options: {
  page: number;
  groupId?: string;
}) {
  const { page, groupId } = options;

  let total = 0;
  let offset = chaptersPerPage * page;
  if (offset > 10000) {
    offset = 10000 - chaptersPerPage;
  }
  const { data, isLoading, error } = useSWR(["last-updates", options], () =>
    MangadexApi.Chapter.getChapter({
      includes: ["scanlation_group"],
      translatedLanguage: ["vi"],
      contentRating: [
        MangadexApi.Static.MangaContentRating.SAFE,
        MangadexApi.Static.MangaContentRating.SUGGESTIVE,
      ],
      order: {
        readableAt: MangadexApi.Static.Order.DESC,
      },
      limit: chaptersPerPage,
      offset,
      groups: groupId ? [groupId] : undefined,
    }),
  );

  if (data) {
    data.data.data.forEach((c) => extendRelationship(c) as ExtendChapter);
    total = data.data.total;
  }

  return {
    chapters: (data?.data.data || []) as ExtendChapter[],
    isLoading,
    error,
    total,
  };
}
