<template>
    <div class="home">
        <svg-sprite />
        <h1>Why Icons?</h1>
        <div class="row">
            <div class="col" v-for="icon in icons" :key="icon">
                <div class="icon-box">
                    <svg class="icon">
                        <use :xlink:href="`#${icon}`" />
                    </svg>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
// @ is an alias to /src
// import SvgSprite from '@/assets/svg-icons-sprite.svg';

export default {
    name: 'Home',
    components: {
        // SvgSprite,
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
    padding: 0 -0.5rem;
    max-width: 960px;
}
.row {
    display: flex;
    flex-flow: row wrap;
    margin-left: -0.5rem;
    margin-right: -0.5rem;
}
.col {
    display: block;
    flex: 1 0 auto;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
}
.icon-box {
    border: 1px solid #ddd;
    border-radius: 0.25rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem;
    width: 100%;
}
</style>
