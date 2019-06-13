<template lang="pug">
    mu-container
      mu-card(style="width: 100%; max-width: 375px; margin: 0 auto;" v-for="(item,index) in PictureList" :key="index")
        mu-card-header()
        mu-card-media()
          img(:src="item.Pictureurl")
        mu-card-title( :sub-title="item.board.title") 
        mu-card-actions
          mu-button(flat="") 观看  {{item.repin_count}}
          mu-button(flat="") 喜欢  {{item.like_coun-t}}
</template>

<script>
export default {
    mounted(){
      this.$http.Get({
        url: 'picture'
      }, (res) =>{
          var picture = res.data.pins
          for(var i=0;i<picture.length;i++){
            picture[i].Pictureurl = 'http://img.hb.aicdn.com/'+picture[i].file.key
          }
          //遍历好再赋值到数组里
          this.PictureList = picture
      })
    },
    data(){
      return {
        PictureList: [],
        Pictureurl:"",
      }
    }
}
</script>


<style lang="less" scoped>

</style>
