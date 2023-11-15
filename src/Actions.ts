import { PersonRepository } from './Database';

export const experiment = async (num: number) => {
  const people = Array(num)
    .fill(0)
    .map((_, index) =>
      PersonRepository.create({
        createdAt: new Date(),
        firstName: `Person ${index}`,
        lastName: `Person Lastname ${index}`,
        age: index % 100,
      }),
    );

  let startTime, endTime;

  startTime = performance.now();
  await PersonRepository.save(people);
  endTime = performance.now();

  console.log(`Creation of ${num} objects took ${endTime - startTime} milliseconds.`);

  startTime = performance.now();
  const peopleSelected = await PersonRepository.find({});
  endTime = performance.now();

  console.log(
    `Selection of ${peopleSelected.length} objects took ${endTime - startTime} milliseconds.`,
  );

  startTime = performance.now();
  await PersonRepository.update({}, { lastName: 'test' });
  endTime = performance.now();

  console.log(`Update action of ${num} objects took ${endTime - startTime} milliseconds.`);

  startTime = performance.now();
  await PersonRepository.delete({});
  endTime = performance.now();

  console.log(`Delete action of ${num} objects took ${endTime - startTime} milliseconds.`);
};
