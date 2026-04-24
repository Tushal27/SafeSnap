# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /build

# Copy dependency manifests first for layer caching.
# The actual source is copied only after dependencies are resolved,
# so incremental rebuilds that only touch source files are fast.
COPY pom.xml .
RUN mvn dependency:go-offline -q

COPY src ./src
RUN mvn package -DskipTests -q

# ── Stage 2: Runtime ───────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine AS runtime

# Create a non-root user for the application process.
RUN addgroup -S safesnap && adduser -S safesnap -G safesnap

WORKDIR /app

# Copy only the fat jar produced by the build stage.
COPY --from=builder /build/target/safesnap-backend-*.jar app.jar

# Drop privileges before starting the process.
USER safesnap

# JVM tuning suitable for containerised environments:
#   -XX:+UseContainerSupport       — respect cgroup CPU/memory limits
#   -XX:MaxRAMPercentage           — use up to 75% of the container's RAM for the heap
#   -Djava.security.egd            — faster SecureRandom on Linux (avoids /dev/random blocking)
ENV JAVA_OPTS="-XX:+UseContainerSupport \
               -XX:MaxRAMPercentage=75.0 \
               -Djava.security.egd=file:/dev/./urandom \
               -Dspring.profiles.active=prod"

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
