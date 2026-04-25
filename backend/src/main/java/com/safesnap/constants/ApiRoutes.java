package com.safesnap.constants;

/**
 * Centralized API route constants.
 * All controller mappings must reference these constants to avoid magic strings.
 */
public final class ApiRoutes {

    private ApiRoutes() {
        throw new UnsupportedOperationException("Constants class");
    }

    public static final String API_V1_BASE = "/api/v1";

    // Auth
    public static final String AUTH_BASE             = API_V1_BASE + "/auth";
    public static final String AUTH_REGISTER_PARENT  = "/register-parent";
    public static final String AUTH_LOGIN            = "/login";
    public static final String AUTH_PAIR_CHILD       = "/pair-child";

    // Alerts
    public static final String ALERTS_BASE           = API_V1_BASE + "/alerts";
    public static final String ALERTS_REPORT         = "/report";
    public static final String ALERTS_LIST           = "/list";
    public static final String ALERTS_ACKNOWLEDGE    = "/acknowledge";

    // Children
    public static final String CHILDREN_BASE         = API_V1_BASE + "/children";

    // Stats
    public static final String STATS_BASE            = API_V1_BASE + "/stats";
    public static final String STATS_WEEKLY          = "/weekly";

    // WebSocket
    public static final String WS_ALERTS             = "/ws/alerts";

    // Health
    public static final String HEALTH                = "/health";
}
