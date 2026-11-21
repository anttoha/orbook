import { useEffect } from "react";
import { saveFeed } from "../api/calendarFeed";
import { useClasses } from "../store/classesStore";
import { classKey, useCalendarFeedStore } from "../store/calendarFeedStore";
import { useUserStore } from "../store/userStore";
import { feedBody } from "../utils/calendarFeed";

// Kalender-Abo (часть 40): поменяли «Meine Kurse» — сразу отправить новые курсы, иначе календарь
// покажет старые. Как у Mitteilungen (usePushOnStart). Смену класса (byClass тоже меняется) пропускаем:
// там курсы просто уезжают к своему классу, у абонемента ничего не поменялось.
export function useCalendarFeedCourses(active) {
  useEffect(() => {
    if (!active) return undefined;
    return useUserStore.subscribe((state, before) => {
      const changed = state.picked !== before.picked || state.hiddenRequired !== before.hiddenRequired;
      if (!changed || state.byClass !== before.byClass) return;
      const feed = useCalendarFeedStore.getState().byClass[classKey(useClasses.getState().activeId)];
      if (!feed?.on || !feed.mine) return;
      saveFeed(feedBody(feed.items, true, state.picked, state.hiddenRequired))
        .then((fresh) => useCalendarFeedStore.getState().remember(fresh))
        .catch(() => {}); // нет сети — отправится, когда снова откроют «Kalender-Abo»
    });
  }, [active]);
}
