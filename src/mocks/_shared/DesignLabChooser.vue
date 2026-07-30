<template>
  <div class="dl-app">
    <aside class="dl-rail">
      <div class="dl-rail-head">
        <p class="dl-rail-title">Design Lab</p>
        <p class="dl-rail-sub">Five candidate designs rendering the real site content. Pick a direction.</p>
      </div>

      <div class="dl-rail-list">
        <button
          v-for="(entry, index) in designs"
          :key="entry.slug"
          class="dl-card"
          :data-role="roleOf(entry.slug)"
          @click="selectDesign(entry.slug)"
        >
          <span class="dl-card-top">
            <span
              class="dl-swatch"
              :style="{ background: `linear-gradient(90deg, ${entry.swatch[0]} 50%, ${entry.swatch[1]} 50%)` }"
            />
            <span class="dl-card-label">{{ entry.label }}</span>
            <span v-if="roleOf(entry.slug) === 'primary'" class="dl-badge">A</span>
            <span v-else-if="roleOf(entry.slug) === 'secondary'" class="dl-badge">B</span>
            <span v-else class="dl-card-fonts">{{ index + 1 }}</span>
          </span>
          <span class="dl-card-blurb">{{ entry.blurb }}</span>
          <span class="dl-card-fonts">{{ entry.fonts.join(' · ') }} · {{ entry.mode }}</span>
        </button>
      </div>

      <div class="dl-rail-foot">
        <kbd>1</kbd>–<kbd>5</kbd> design · <kbd>←</kbd><kbd>→</kbd> page · <kbd>c</kbd> compare<br />
        Width presets trigger real CSS media queries. They do not emulate a device.
      </div>
    </aside>

    <div class="dl-main">
      <div class="dl-topbar">
        <div class="dl-group">
          <span class="dl-group-label">Page</span>
          <div class="dl-seg">
            <button
              v-for="p in pages"
              :key="p"
              :aria-pressed="page === p"
              @click="page = p"
            >
              {{ pageLabels[p] }}
            </button>
          </div>
        </div>

        <div class="dl-group">
          <span class="dl-group-label">Width</span>
          <div class="dl-seg">
            <button
              v-for="preset in viewports"
              :key="String(preset)"
              :aria-pressed="viewport === preset"
              @click="viewport = preset"
            >
              {{ preset === 'fill' ? 'Fill' : preset }}
            </button>
          </div>
        </div>

        <div class="dl-group">
          <span class="dl-group-label">Mode</span>
          <div class="dl-seg">
            <button :aria-pressed="mode === 'single'" @click="mode = 'single'">Single</button>
            <button :aria-pressed="mode === 'compare'" @click="mode = 'compare'">Compare</button>
          </div>
        </div>

        <span class="dl-spacer" />

        <a class="dl-open" :href="primaryUrl" target="_blank" rel="noopener">Open standalone ↗</a>
      </div>

      <div class="dl-stage">
        <section v-for="pane in panes" :key="pane.role" class="dl-pane">
          <header class="dl-pane-head">
            <span v-if="mode === 'compare'" class="dl-badge">{{ pane.role === 'primary' ? 'A' : 'B' }}</span>
            <strong>{{ registry[pane.slug].label }}</strong>
            <span>· {{ pageLabels[page] }}</span>
            <span class="dl-spacer" />
            <span>{{ viewport === 'fill' ? 'fill' : viewport + 'px' }}</span>
          </header>
          <div class="dl-frame-wrap">
            <div v-if="!loaded[pane.key]" class="dl-loading">
              <span class="dl-dot" /> loading {{ registry[pane.slug].label }}…
            </div>
            <!-- :key forces a fresh element per design/page so the previous
                 document is torn down and its CSS animations stop. -->
            <iframe
              :key="pane.key"
              class="dl-frame"
              :src="pane.url"
              :title="`${registry[pane.slug].label} — ${pageLabels[page]}`"
              :style="{ width: viewport === 'fill' ? '100%' : viewport + 'px' }"
              @load="loaded[pane.key] = true"
            />
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'

import {
  DESIGN_REGISTRY,
  DESIGN_SLUGS,
  MOCK_PAGES,
  PAGE_LABELS,
  isDesignSlug,
  isMockPage,
  mockPageUrl,
  type DesignSlug,
  type MockPage,
} from '../registry'

type ViewportPreset = 375 | 768 | 1280 | 'fill'

const registry = DESIGN_REGISTRY
const designs = DESIGN_SLUGS.map((slug) => DESIGN_REGISTRY[slug])
const pages = MOCK_PAGES
const pageLabels = PAGE_LABELS
const viewports: ViewportPreset[] = [375, 768, 1280, 'fill']

const primary = ref<DesignSlug>('terminal')
const secondary = ref<DesignSlug>('editorial')
const page = ref<MockPage>('home')
const viewport = ref<ViewportPreset>('fill')
const mode = ref<'single' | 'compare'>('single')

const loaded = reactive<Record<string, boolean>>({})

const panes = computed(() => {
  const list: { role: 'primary' | 'secondary'; slug: DesignSlug; url: string; key: string }[] = [
    {
      role: 'primary',
      slug: primary.value,
      url: mockPageUrl(primary.value, page.value),
      key: `primary:${primary.value}:${page.value}`,
    },
  ]
  if (mode.value === 'compare') {
    list.push({
      role: 'secondary',
      slug: secondary.value,
      url: mockPageUrl(secondary.value, page.value),
      key: `secondary:${secondary.value}:${page.value}`,
    })
  }
  return list
})

const primaryUrl = computed(() => mockPageUrl(primary.value, page.value))

const roleOf = (slug: DesignSlug) => {
  if (slug === primary.value) return 'primary'
  if (mode.value === 'compare' && slug === secondary.value) return 'secondary'
  return 'idle'
}

// In compare mode a second click assigns B, so pairs can be built without a
// separate control. In single mode every click reassigns A.
const selectDesign = (slug: DesignSlug) => {
  if (slug === primary.value) return
  if (mode.value === 'compare' && slug !== secondary.value) {
    secondary.value = slug
    return
  }
  primary.value = slug
}

const parseHash = () => {
  const raw = window.location.hash.replace(/^#/, '')
  if (!raw) return
  const [designPart, pagePart] = raw.split('/')
  const slugs = designPart.split('+')
  if (slugs[0] && isDesignSlug(slugs[0])) primary.value = slugs[0]
  if (slugs[1] && isDesignSlug(slugs[1])) {
    secondary.value = slugs[1]
    mode.value = 'compare'
  }
  if (pagePart && isMockPage(pagePart)) page.value = pagePart
}

const writeHash = () => {
  const designPart =
    mode.value === 'compare' ? `${primary.value}+${secondary.value}` : primary.value
  history.replaceState(null, '', `#${designPart}/${page.value}`)
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.metaKey || event.ctrlKey || event.altKey) return
  const index = Number(event.key)
  if (index >= 1 && index <= DESIGN_SLUGS.length) {
    selectDesign(DESIGN_SLUGS[index - 1])
    return
  }
  if (event.key === 'c') {
    mode.value = mode.value === 'single' ? 'compare' : 'single'
    return
  }
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    const at = MOCK_PAGES.indexOf(page.value)
    const next = event.key === 'ArrowRight' ? at + 1 : at - 1
    page.value = MOCK_PAGES[(next + MOCK_PAGES.length) % MOCK_PAGES.length]
  }
}

onMounted(() => {
  parseHash()
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('hashchange', parseHash)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('hashchange', parseHash)
})

watch([primary, secondary, page, mode], writeHash)
</script>
