const tmpl = (content, options = {}) => {
    const config = { componentName: 'svg-sprite', ...options };

    return `
<template>
    ${content}
</template>

<script>
    export default {
        name: '${config.componentName}',
    };
</script>
    `;
};

module.exports = tmpl;
