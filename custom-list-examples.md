# CustomList Component Examples

Use `CustomList` and `CustomListItem` components to change listitem markers

<br>


<CustomList>
  <template #marker>
    <material-symbols-check-circle-unread class="text-green text-2xl"/>
  </template>

- One good thing
- Another good thing

</CustomList>

<CustomList>
  <template #marker>
    <material-symbols-frame-exclamation class="text-peach"/>
  </template>

- Scary bad thing
- Scary, but not so bad of a thing

</CustomList>
