// kafka/handlers/general.handler.js

/**
 * Fallback handler for any event type without a dedicated handler.
 * Logs a warning instead of throwing so unrecognized/future event
 * types don't repeatedly fail and pile up in the DLQ while a real
 * handler is being implemented.
 */
export const generalHandler = async (payload, event) => {
  console.warn(
    `[kafka:handler:general] No specific handler for event type "${event?.type}". Payload:`,
    payload
  );
};

export default generalHandler;