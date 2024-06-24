<script setup lang="ts">

</script>

<template>
  <div class="modal fade" id="newKsyModal" tabindex="-1" role="dialog" aria-labelledby="newKsyModalLabel">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span
              aria-hidden="true">&times;</span></button>
          <h4 class="modal-title" id="newKsyModalLabel">Create new .ksy format file</h4>
        </div>
        <form>
          <div class="modal-body">
            <div class="form-group">
              <label for="newKsyName" class="control-label">Name:</label>
              <input type="text" class="form-control" id="newKsyName">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
            <button type="submit" class="btn btn-primary">Create</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>