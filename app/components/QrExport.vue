<template>
  <div class="qr-export">
    <canvas ref="canvas" :width="size" :height="size" style="display:none"></canvas>
    <div class="qr-actions">
      <button @click="generate">Generate QR Code</button>
      <!-- <button @click="download" :disabled="!dataUrl">Download PNG</button> -->
        <button @click="download" :disabled="!dataUrl">Download PNG</button>
      </div>
    <div class="qr-preview">
      <img v-if="dataUrl" :src="dataUrl" :alt="`QR code for ${textPreview}`" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";

const props = defineProps({
  text: { type: String, default: "" },
  size: { type: Number, default: 300 },
});

const canvas = ref(null);
const dataUrl = ref("");

const textPreview = props.text || "";

const generate = async () => {
  if (!props.text) return;
  if (typeof window === "undefined") return;
  try {
    const QR = (await import("qrcode")).default;
    dataUrl.value = await QR.toDataURL(props.text, { width: props.size, margin: 2 });
    if (canvas.value) await QR.toCanvas(canvas.value, props.text, { width: props.size, margin: 2 });
  } catch (e) {
      // console.error(e);
    dataUrl.value = "";
  }
};

const download = () => {
  if (!dataUrl.value) return;
  const a = document.createElement("a");
  a.href = dataUrl.value;
  a.download = "page-qr.png";
  document.body.appendChild(a);
  a.click();
  a.remove();
};

// Export to PDF removed due to missing jspdf dependency. Use PNG download instead.
</script>

<style scoped>
.qr-export {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.qr-actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  margin-bottom: 24px;
  justify-content: center;
}

.qr-actions button {
  padding: 10px 16px;
  font-size: 16px;
  font-weight: 600;
  background-color: #007f3f;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.qr-actions button:hover:not(:disabled) {
  background-color: #006b36;
}

.qr-actions button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.qr-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 12px;
}

.qr-preview img {
  max-width: 220px;
  height: auto;
  border: 1px solid #ddd;
  padding: 8px;
  background-color: #fff;
}
</style>

