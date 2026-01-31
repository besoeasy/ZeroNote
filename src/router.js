import { createRouter, createWebHashHistory } from "vue-router";


import Dashboard from "@/views/dashboard.vue";
import Note from "@/views/note.vue";
import NoteEdit from "@/views/note-edit.vue";
import Backup from "@/views/backup.vue";
import Insights from "@/views/insights.vue";
import p2p from "@/views/p2p.vue";
import Sync from "@/views/sync.vue";
import ImportView from "@/views/import.vue";
import IpfsNote from "@/views/ipfs-note.vue";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      redirect: "/dashboard",
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: Dashboard,
    },
    {
      path: "/notes/:id",
      name: "note",
      component: Note,
    },
    {
      path: "/notes/:id/edit",
      name: "note-edit",
      component: NoteEdit,
    },
    {
      path: "/backup",
      name: "backup",
      component: Backup,
    },
    {
      path: "/insights",
      name: "insights",
      component: Insights,
    },
    {
      path: "/p2p",
      name: "p2p",
      component: p2p,
    },
    {
      path: "/data",
      alias: "/sync",
      name: "data",
      component: Sync,
    },
    {
      path: "/import",
      name: "import",
      component: ImportView,
    },
    {
      // Supports encrypted share links like: https://zeronote.js.org/#/ok/Qm.../<key>
      path: "/ok/:cid(Qm[1-9A-HJ-NP-Za-km-z]{44}|bafy[a-z2-7]{50,})/:key([A-Za-z0-9_-]{20,})",
      name: "ipfs-note-key",
      component: IpfsNote,
    },
    {
      // Supports public share links like: https://zeronote.js.org/#/ok/Qm... or #/ok/bafy...
      path: "/ok/:cid(Qm[1-9A-HJ-NP-Za-km-z]{44}|bafy[a-z2-7]{50,})",
      name: "ipfs-note",
      component: IpfsNote,
    },
    {
      // Backwards-compatible legacy route: https://zeronote.js.org/#/Qm...
      path: "/:cid(Qm[1-9A-HJ-NP-Za-km-z]{44}|bafy[a-z2-7]{50,})",
      redirect: (to) => ({ name: "ipfs-note", params: { cid: to.params.cid } }),
    },
  ],
});

export default router;
