.PHONY: startserver seed test

seed:
	python -m users.seed

startserver: seed
	uvicorn main:app --reload

test:
	pytest
