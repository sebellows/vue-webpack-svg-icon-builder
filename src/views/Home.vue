<template>
    <div class="home">
        <svg-sprite />
        <h1>Why Icons?</h1>
        <div class="icon-row">
            <div class="icon-box" v-for="icon in icons" :key="icon">
                <svg class="icon" width="32" height="32">
                    <use :xlink:href="`#${icon}`" />
                </svg>
            </div>
        </div>
    </div>
</template>

<script>
// @ is an alias to /src
import SvgSprite from '@/components/SvgSprite.vue';

export default {
    name: 'Home',
    components: {
        SvgSprite,
    },

    data() {
        return {
            icons: ['asterix', 'at', 'award'],
        };
    },
};
</script>

<style>
.container {
    margin: auto;
    padding: 1rem;
    max-width: 960px;
}
.icon-row {
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    justify-content: center;
}
.icon-box {
    background-color: #eee;
    border: 1px solid #ddd;
    border-radius: 0.25rem;
    display: inline-flex;
    /* flex: 1 1 auto; */
    align-items: center;
    justify-content: center;
    margin: 0.25rem;
    padding: 0.25rem;
    width: min-content;
}
.icon {
    flex: none;
}
</style>
