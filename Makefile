PR = pnpm run

r:
	$(PR) release
t:
	$(PR) check-types
l:
	$(PR) lint
c:
	$(PR) clean
b:
	$(PR) build
d:
	$(PR) dev
