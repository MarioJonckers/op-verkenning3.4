# Makefile in de projectroot
# Set je Docker Hub user en image naam hier:
REGISTRY_USER := jonckerswillems
IMAGE_NAME    := belgische-quiz

# Pak versie uit package.json (fallback naar git tag)
VERSION := $(shell node -p "require('./package.json').version" 2>/dev/null || echo "0.0.0")
BUILD_ARGS := --build-arg APP_VERSION=$(VERSION)

# Multi-arch buildx builder (eenmalig run je `make builder`)
builder:
	docker buildx create --name m1 --driver docker-container --use || true
	docker buildx inspect --bootstrap

# Build & push multi-arch voor arm64+amd64
publish: builder
	docker buildx build \
		--platform linux/amd64,linux/arm64 \
		-t $(REGISTRY_USER)/$(IMAGE_NAME):$(VERSION) \
		-t $(REGISTRY_USER)/$(IMAGE_NAME):latest \
		$(BUILD_ARGS) \
		--push .

# Handige combo: bump patch + push code + build en push images
release-patch:
	npm version patch -m "chore: release %s"
# 	git push && git push --tags
	$(MAKE) publish

release-minor:
	npm version minor -m "chore: release %s"
# 	git push && git push --tags
	$(MAKE) publish

release-major:
	npm version major -m "chore: release %s"
# 	git push && git push --tags
	$(MAKE) publish