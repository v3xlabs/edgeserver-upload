# Edgeserver Upload

More Soon(tm)

## Example Github Action

```yaml
- name: Edgeserver Upload
  uses: lvkdotsh/edgeserver-action@v0.0.34
  with:
    app_id: "987654321"
    server: https://api.edgeserver.io
    token: ${{ secrets.SIGNAL_TOKEN }}
    directory: dist
```
