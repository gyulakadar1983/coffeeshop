<template class="js-table-empty-t">
  <div class="table-empty">
    <img
      class="table-empty__image"
      src="/static/<?php echo $empty_img_name ?>"
      width="<?php echo $empty_img_width ?>"
      height="<?php echo $empty_img_height ?>"
      loading="lazy"
      decoding="async"
      alt="Результатов не найдено"
    >
    <h2 class="table-empty__heading">Нет результатов</h2>
    <p class="table-empty__text">По вашему запросу не найдено ни одного результата.</p>
    <p class="table-empty__text">Попробуйте изменить параметры поиска и попробовать снова.</p>
  </div>
</template>