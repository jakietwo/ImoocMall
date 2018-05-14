<template>
  <div>
  <div class="md-modal modal-msg md-modal-transition " v-bind:class="{'md-show':mdshow}" >
    <div class="md-modal-inner">
      <div class="md-top">

        <button class="md-close" @click="closeModal">Close</button>
      </div>
      <div class="md-content">
        <div class="confirm-tips">
          <slot name="message"></slot>
        </div>
        <div class="login-wrap">
          <slot name="btnGroup"></slot>
        </div>
      </div>
    </div>
  </div>
  <div class="md-overlay" v-if="mdshow" @click="closeModal"></div>
  </div>
</template>
<script type="text/ecmascript-6">
 export default {
   props:["mdshow"],
   data(){
     return {

     }
   },
   methods:{
     closeModal(){
       this.$emit('close')
     }
   }
 };
</script>


