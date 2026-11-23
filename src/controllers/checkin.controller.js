import {
  getFirstCheckin,
  countEventCheckins,
} from "../repositories/checkin.repository.js";
import { validateCheckin } from "../models/checkin.model.js";
import { run, db } from "../config/database.js";
import { auth, internal } from "../middleware/auth.middleware.js";
import { call } from "../services/http.service.js";
import { log } from "../utils/logger.js";
export function registerCheckinRoutes(router) {
  router.post("/checkin", auth(["portero"]), async (req, res, next) => {
    try {
      const { code, event_id } = req.body;
      if (!code || !event_id)
        return res.status(400).json({ error: "Código y evento requeridos" });
      validateCheckin({ code, event_id });
      let ticket;
      try {
        ticket = await call(
          process.env.TICKETS_URL,
          `/tickets/${encodeURIComponent(code)}/validate`,
        );
      } catch (e) {
        return res
          .status(e.status === 404 ? 400 : 503)
          .json({
            permitido: false,
            motivo:
              e.status === 404
                ? "Código inválido"
                : "No se pudo verificar la entrada",
          });
      }
      if (String(ticket.event_id) !== String(event_id))
        return res
          .status(400)
          .json({ permitido: false, motivo: "Entrada de otro evento" });
      if (!ticket.pagada)
        return res
          .status(400)
          .json({ permitido: false, motivo: "Entrada no pagada" });
      const x = await run(
        "INSERT INTO checkins(code,event_id,porter_id) VALUES($1,$2,$3) ON CONFLICT(code) DO NOTHING RETURNING *",
        [code, event_id, req.user.id],
      );
      if (!x.rowCount) {
        const old = await getFirstCheckin(code);
        return res
          .status(409)
          .json({
            permitido: false,
            motivo: "Entrada ya utilizada",
            primer_ingreso: old?.created_at,
          });
      }
      res.status(201).json({ permitido: true, ingreso: x.rows[0] });
    } catch (e) {
      next(e);
    }
  });
  router.get(
    "/checkin/count/:event",
    auth(["portero", "organizador"]),
    async (req, res, next) => {
      try {
        res.json({ total: await countEventCheckins(req.params.event) });
      } catch (e) {
        next(e);
      }
    },
  );
}
