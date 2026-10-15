<script setup lang="ts">
// YouTube Developer Policies III.A: an API client shows a link to YouTube's Terms of Service where people
// connect a channel, and says that connecting means agreeing to them.
</script>

<template>
  <p class="tiny muted yt-terms" role="note">
    Siar uses YouTube API Services. By connecting a YouTube channel you agree to the
    <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener">YouTube Terms of Service</a>, and Google's
    <a href="https://www.google.com/policies/privacy" target="_blank" rel="noopener">Privacy Policy</a> applies. See Siar's
    <a href="https://siaran.my/privacy" target="_blank" rel="noopener">privacy policy</a>. You can revoke access any time in your
    <a href="https://security.google.com/settings/security/permissions" target="_blank" rel="noopener">Google security settings</a>.
  </p>
</template>

<style scoped>
.yt-terms a { color: inherit; text-decoration: underline; text-underline-offset: 2px; }
</style>
