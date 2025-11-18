<script setup lang="ts">
import { computed, inject } from 'vue'

const props = defineProps<{
  username?: string
  avatar?: string
  side?: 'left' | 'right' | 'center'
  color?: 'blue' | 'green' | 'mauve' | 'peach' | 'yellow' | 'teal' | 'pink' | 'lavender' | 'sapphire'
  timestamp?: string
}>()

// Track usernames for automatic positioning
const seenUsernames = inject<Set<string>>('seenUsernames', new Set())
const firstUsername = inject<{ value: string | null }>('firstUsername', { value: null })

const bubbleColor = computed(() => {
  const colorMap: Record<string, string> = {
    blue: 'var(--c-blue)',
    green: 'var(--c-green)',
    mauve: 'var(--c-mauve)',
    peach: 'var(--c-peach)',
    yellow: 'var(--c-yellow)',
    teal: 'var(--c-teal)',
    pink: 'var(--c-pink)',
    lavender: 'var(--c-lavender)',
    sapphire: 'var(--c-sapphire)'
  }
  return colorMap[props.color || 'blue'] || colorMap.blue
})

const position = computed(() => {
  // Special handling for "nobody" - always center
  if (props.username?.toLowerCase() === 'nobody') {
    return 'center'
  }

  // If side is explicitly set, use it
  if (props.side) {
    return props.side
  }

  // Auto-detect based on username order
  if (props.username) {
    // Track the first username seen
    if (firstUsername.value === null) {
      firstUsername.value = props.username
    }

    // Add to seen usernames
    seenUsernames.add(props.username)

    // First username goes left, others go right
    return props.username === firstUsername.value ? 'left' : 'right'
  }

  // Default to left if no username
  return 'left'
})

const isLeft = computed(() => position.value === 'left')
const isCenter = computed(() => position.value === 'center')
const isRight = computed(() => position.value === 'right')
</script>

<template>
  <div
    class="chat-message"
    :class="{
      'chat-message-right': isRight,
      'chat-message-center': isCenter
    }">
    <!-- Avatar (optional) -->
    <div v-if="avatar && !isCenter" class="chat-avatar" :class="{ 'order-2': isRight }">
      <img :src="avatar" :alt="username || 'User'" />
    </div>

    <div class="chat-content">
      <!-- Username header -->
      <div
        v-if="username && username.toLowerCase() !== 'nobody'"
        class="chat-username"
        :class="{ 'text-right': isRight, 'text-center': isCenter }">
        {{ username }}
        <span v-if="timestamp" class="chat-timestamp">{{ timestamp }}</span>
      </div>

      <!-- Message bubble -->
      <div
        class="chat-bubble"
        :class="{
          'chat-bubble-right': isRight,
          'chat-bubble-center': isCenter
        }"
        :style="{ '--bubble-color': bubbleColor }">
        <div class="chat-bubble-content">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-message {
  display: flex;
  gap: 0.5rem;
  margin: 0.5rem 0;
  align-items: flex-start;
}

.chat-message-right {
  flex-direction: row-reverse;
}

.chat-message-center {
  justify-content: center;
}

.chat-avatar {
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  overflow: hidden;
  background-color: var(--c-surface0);
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.chat-content {
  flex: 1;
  min-width: 0;
  max-width: 75%;
}

.chat-username {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--c-subtext0);
  margin-bottom: 0.125rem;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.chat-username.text-right {
  justify-content: flex-end;
}

.chat-username.text-center {
  justify-content: center;
}

.chat-timestamp {
  font-size: 0.75rem;
  font-weight: 400;
  color: var(--c-subtext1);
}

.chat-bubble {
  background-color: var(--c-surface0);
  border: 1px solid var(--c-surface1);
  border-radius: 1rem;
  border-bottom-left-radius: 0.25rem;
  padding: 0.5rem 0.75rem;
  position: relative;
  color: var(--c-text);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.chat-bubble-right {
  background-color: color-mix(in srgb, var(--bubble-color) 15%, var(--c-base));
  border-color: color-mix(in srgb, var(--bubble-color) 30%, var(--c-surface1));
  border-bottom-left-radius: 1rem;
  border-bottom-right-radius: 0.25rem;
}

.chat-bubble-center {
  background-color: var(--c-surface1);
  border-color: var(--c-surface2);
  border-radius: 0.5rem;
  text-align: center;
  font-size: 0.875rem;
  font-style: italic;
  color: var(--c-subtext0);
}

.chat-bubble-content {
  line-height: 1.6;
}

/* Text content */
.chat-bubble :deep(p) {
  margin: 0;
  line-height: 1.4;
}

.chat-bubble :deep(p:not(:last-child)) {
  margin-bottom: 0.25rem;
}

.chat-bubble :deep(strong) {
  font-weight: 600;
  color: var(--c-text);
}

.chat-bubble :deep(em) {
  font-style: italic;
}

/* Code blocks */
.chat-bubble :deep(pre) {
  margin: 0.5rem 0;
  padding: 0.75rem;
  background-color: var(--c-crust);
  border-radius: 0.5rem;
  overflow-x: auto;
  border: 1px solid var(--c-surface0);
}

.chat-bubble :deep(code) {
  font-family: 'Fira Code', 'Courier New', monospace;
  font-size: 0.875em;
}

.chat-bubble :deep(p code),
.chat-bubble :deep(li code) {
  background-color: var(--c-surface1);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  color: var(--c-text);
  border: 1px solid var(--c-surface2);
}

/* Images */
.chat-bubble :deep(img) {
  max-width: 100%;
  border-radius: 0.5rem;
  margin: 0.5rem 0;
  display: block;
}

/* Links */
.chat-bubble :deep(a) {
  color: var(--c-blue);
  text-decoration: none;
  transition: color 0.2s;
}

.chat-bubble :deep(a:hover) {
  color: var(--c-sapphire);
  text-decoration: underline;
}

/* Lists */
.chat-bubble :deep(ul),
.chat-bubble :deep(ol) {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.chat-bubble :deep(li) {
  margin: 0.25rem 0;
}

/* Blockquotes */
.chat-bubble :deep(blockquote) {
  margin: 0.5rem 0;
  padding-left: 1rem;
  border-left: 3px solid var(--c-surface2);
  color: var(--c-subtext0);
  font-style: italic;
}
</style>
