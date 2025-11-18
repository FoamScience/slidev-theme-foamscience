<script setup lang="ts">
import { provide, ref, reactive } from 'vue'

defineProps<{
  title?: string
  compact?: boolean
  maxHeight?: string
}>()

// Provide shared state for username tracking
const seenUsernames = reactive(new Set<string>())
const firstUsername = ref<string | null>(null)

provide('seenUsernames', seenUsernames)
provide('firstUsername', firstUsername)
</script>

<template>
  <div class="chat-conversation" :class="{ 'chat-conversation-compact': compact }">
    <div v-if="title" class="chat-header">
      <div class="chat-title">{{ title }}</div>
    </div>
    <div class="chat-messages" :style="{ maxHeight: maxHeight || '600px' }">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.chat-conversation {
  background-color: var(--c-mantle);
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin: 1rem 0;
  border: 1px solid var(--c-surface0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chat-conversation-compact {
  padding: 1rem;
}

.chat-header {
  border-bottom: 1px solid var(--c-surface0);
  padding-bottom: 0.75rem;
  margin-bottom: 1rem;
}

.chat-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--c-text);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.chat-title::before {
  content: '';
  display: inline-block;
  width: 0.5rem;
  height: 0.5rem;
  background-color: var(--c-green);
  border-radius: 50%;
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--c-green) 30%, transparent);
}

.chat-messages {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 0.5rem;
}

/* Custom scrollbar styling */
.chat-messages::-webkit-scrollbar {
  width: 8px;
}

.chat-messages::-webkit-scrollbar-track {
  background-color: var(--c-surface0);
  border-radius: 4px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background-color: var(--c-surface2);
  border-radius: 4px;
  transition: background-color 0.2s;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background-color: var(--c-overlay0);
}

/* Firefox scrollbar styling */
.chat-messages {
  scrollbar-width: thin;
  scrollbar-color: var(--c-surface2) var(--c-surface0);
}
</style>
